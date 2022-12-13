import 'regenerator-runtime/runtime';
import React, { useEffect, useMemo } from 'react';
import { DeskContext, State } from '../context';
import { bufferToNum, hexStrToArray } from 'renderer/helpers';
import { omit } from 'lodash';
import { useDebounce } from 'use-debounce';
import { twMerge } from 'tailwind-merge';

const serviceID = '99fa0001-338a-1024-8a49-009c0215f78a';
const charID = '99fa0002-338a-1024-8a49-009c0215f78a';

const positionServiceID = '99fa0020-338a-1024-8a49-009c0215f78a';
const positionCharID = '99fa0021-338a-1024-8a49-009c0215f78a';

export const DeskProvider: React.FC<any> = ({ children }) => {
  const namePrefix = 'Desk';

  const [state, dispatch] = React.useReducer<
    React.Reducer<State, { type: string; payload: any }>
  >(
    (state: State, action) => {
      switch (action.type) {
        case 'SET_DEVICE':
          return { ...state, device: action.payload };
        case 'SET_SERVER':
          return { ...state, server: action.payload };
        case 'SET_SERVICE':
          return { ...state, service: action.payload };
        case 'SET_POSITION':
          return { ...state, currentPosition: action.payload };
        case 'SET_IS_SAVING':
          return { ...state, isSaving: action.payload };
        case 'SET_MEMO':
          return { ...state, memos: action.payload };
        case 'SET_MOVE':
          return { ...state, move: action.payload };
        default:
          return state;
      }
    },
    {
      device: null,
      server: null,
      service: null,
      currentPosition: null,
      move: null,
      isSaving: false,
      memos: {
        1: Number(localStorage.getItem('memo-1')),
        2: Number(localStorage.getItem('memo-2')),
        3: Number(localStorage.getItem('memo-3')),
        4: Number(localStorage.getItem('memo-4')),
      },
    }
  );

  const shouldStop: boolean | null = React.useMemo(
    () =>
      state.move !== null && state.currentPosition !== null
        ? (state.move.direction === 'down'
            ? state.currentPosition - state.move.to
            : state.move.direction === 'up'
            ? state.move.to - state.currentPosition
            : -1) < 0
        : null,
    [state.move, state.currentPosition]
  );

  const callbacks = React.useMemo(
    () => ({
      /**
       * onPair
       * paring to desktop
       */
      onPair: async () => {
        try {
          const appNavigator = navigator as any;
          if (appNavigator.bluetooth === undefined)
            throw 'Bluetooth is not supported.';
          const options = {
            optionalServices: [serviceID, positionServiceID],
            filters: [{ namePrefix }],
          };
          return appNavigator.bluetooth
            .requestDevice(options)
            .then((device: any) => {
              if (device) {
                dispatch({ type: 'SET_DEVICE', payload: device });
                device.addEventListener('gattserverdisconnected', () => {
                  new Notification('IDASEN disconnected!', {
                    body: 'please re-connect!',
                  });
                });
              }
            });
        } catch (error) {
          throw error;
        }
      },
      /**
       * saveMemo
       * tries to target save memo into localStorage + state
       * @param memo
       */
      saveMemo: (memo: number) => {
        if (state.currentPosition !== null) {
          localStorage.setItem(
            `memo-${memo}`,
            state.currentPosition.toString()
          );
          dispatch({
            type: 'SET_MEMO',
            payload: { ...state.memos, [memo]: state.currentPosition },
          });
          dispatch({
            type: 'SET_IS_SAVING',
            payload: false,
          });
        } else throw 'Current position is null.';
      },
      /**
       * setIsSaving
       * toggles isSaving state
       */
      setIsSaving: () => {
        dispatch({ type: 'SET_IS_SAVING', payload: !state.isSaving });
      },
      /**
       * move
       * @param position
       */
      moveTo: (action: 'up' | 'down' | 1 | 2 | 3 | 4) => {
        if (
          action === 1 ||
          action === 2 ||
          action === 3 ||
          (action === 4 &&
            state.memos[action] !== null &&
            state.currentPosition !== null)
        ) {
          const direction =
            state.currentPosition < state.memos[action] ? 'up' : 'down';
          dispatch({
            type: 'SET_MOVE',
            payload: {
              direction,
              to: state.memos[action],
              isDoing: false,
            },
          });
        } else if (action === 'up' || action === 'down') {
          console.log('MOVE UP/DOWN/STOP');
          dispatch({
            type: 'SET_MOVE',
            payload: {
              direction: action,
              to: (state.currentPosition ?? 0) + (action === 'up' ? 1 : -1),
              isDoing: false,
            },
          });
        }
      },
    }),
    [state]
  );

  const moveUp = async () => {
    await sendCmd('4700');
  };

  const moveDown = async () => {
    await sendCmd('4600');
  };

  const _stop = async () => {
    await sendCmd('FF00');
  };

  const sendCmd = async (cmd: string) => {
    if (state.service === null) throw 'Service is not connected.';
    // set Is Doing
    dispatch({
      type: 'SET_MOVE',
      payload: {
        ...state.move,
        isDoing: true,
      },
    });
    // SEND COMMAND -> once ended set is Not Doing
    const char = await state.service.getCharacteristic(charID);
    await char.writeValue(hexStrToArray(cmd)).then((v) => {
      if (!shouldStop) {
        dispatch({
          type: 'SET_MOVE',
          payload: {
            ...state.move,
            isDoing: false,
          },
        });
      }
    });
  };

  /**
   * SERVER GET
   */
  React.useEffect(() => {
    const getServer = async () => {
      if (!state.device?.gatt) throw 'Device is not connected.';
      const server = await state.device.gatt.connect();
      dispatch({ type: 'SET_SERVER', payload: server });
    };
    if (state.device && !state.server && !state.service) getServer();
  }, [state.device]);

  /**
   * SERVICE GET
   */
  React.useEffect(() => {
    const getService = async () => {
      const service = await state.server.getPrimaryService(serviceID);
      dispatch({ type: 'SET_SERVICE', payload: service });
    };
    if (state.device && !state.service) getService();
  }, [state.server]);

  /**
   * SERVICE POSITION LISTENER
   */
  React.useEffect(() => {
    if (state.service) {
      const onPositionChange = async () => {
        // add event listener to position
        const service = await state.server.getPrimaryService(positionServiceID);
        const char = await service.getCharacteristic(positionCharID);
        await char.startNotifications();
        char.addEventListener('characteristicvaluechanged', (evt: any) => {
          const position = bufferToNum(evt.target.value.buffer);
          dispatch({ type: 'SET_POSITION', payload: position });
        });
        // initial position
        dispatch({
          type: 'SET_POSITION',
          payload: bufferToNum((await char.readValue()).buffer),
        });
      };

      onPositionChange();
    }
  }, [state.service]);

  /**
   *
   */
  React.useEffect(() => {
    if (state.move === null) return;
    if (state.currentPosition === null) return;
    if (state.move.isDoing) return;
    if (shouldStop) {
      _stop();
      dispatch({ type: 'SET_MOVE', payload: null });
      return;
    }
    state.move.direction === 'up'
      ? moveUp()
      : state.move.direction === 'down'
      ? moveDown()
      : _stop();
  }, [state.currentPosition, state.move]);

  return (
    <DeskContext.Provider
      value={{
        state,
        callbacks,
      }}
    >
      {children}
    </DeskContext.Provider>
  );
};
