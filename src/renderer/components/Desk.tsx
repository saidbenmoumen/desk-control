import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  fa1,
  fa2,
  fa3,
  fa4,
  faArrowDown,
  faArrowUp,
  faChevronDown,
  faChevronUp,
  faCircleNotch,
  faFloppyDisk,
  faPencil,
  faToggleOff,
  faToggleOn,
} from '@fortawesome/free-solid-svg-icons';
import { useDesk } from '../hooks';
import { faBluetooth } from '@fortawesome/free-brands-svg-icons';
import { twMerge } from 'tailwind-merge';
import { posToCm } from '../helpers';
import { Button, ButtonGroup } from './ButtonGroup/ButtonGroup';

export const Desk = () => {
  const slots: [1, 2, 3, 4] = [1, 2, 3, 4];
  const [min, setMin] = React.useState<number>(30);

  const {
    state: { device, memos, currentPosition, isSaving, move },
    callbacks: { onPair, saveMemo, setIsSaving, moveTo, _stop },
  } = useDesk();

  const [lastMove, setLastMove] = React.useState<1 | 4>(4);
  const [timedMove, setTimedMove] = React.useState<boolean>(false);

  useEffect(() => {
    if (timedMove) {
      setInterval(() => {
        setLastMove((l) => (l === 1 ? 4 : 1));
        moveTo(lastMove);
        new Notification('POSITION CHANGED!', {
          body: lastMove === 1 ? 'SITTING...' : 'STANDING...',
        });
      }, 1000 * 60 * min);
    }
  }, [timedMove]);

  return (
    <div className="p-7 flex flex-1 flex-col justify-center items-center gap-5">
      <div className="flex flex-col gap-2 items-center justify-center">
        <h1
          className={`text-white font-thin uppercase ${
            device ? 'text-6xl' : ''
          }`}
        >
          {device ? (
            currentPosition ? (
              posToCm(currentPosition)
            ) : (
              <FontAwesomeIcon icon={faCircleNotch} spin />
            )
          ) : (
            'NOT CONNECTED'
          )}
        </h1>
        {device && <h2 className="text-zinc-400 text-xl">{device?.name}</h2>}
      </div>

      {!device && (
        <button
          className="border border-neutral-700 shadow text-white hover:shadow-lg hover:shadow-neutral-700 transition-all duration-200 ease-in-out bg-transparent py-3 px-5 text-xl rounded font-medium"
          onClick={() => onPair()}
        >
          <FontAwesomeIcon icon={faBluetooth} size={'lg'} /> Connect
        </button>
      )}

      {device && (
        <>
          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-3">
              <ButtonGroup>
                <Button
                  className="px-5"
                  id="up"
                  disabled={!device || isSaving || move?.isDoing}
                  onMouseDown={() => moveTo('up')}
                  onMouseUp={() => _stop(null)}
                >
                  <FontAwesomeIcon icon={faChevronUp} size={'xl'} />
                </Button>
                <Button
                  className="px-5"
                  id="down"
                  disabled={!device || isSaving || move?.isDoing}
                  onMouseDown={() => moveTo('down')}
                  onMouseUp={() => _stop(null)}
                >
                  <FontAwesomeIcon icon={faChevronDown} size={'xl'} />
                </Button>
                {slots.map((slot: 1 | 2 | 3 | 4) => {
                  const memoSlot: number | null = memos?.[slot];
                  return (
                    <Button
                      key={`slot-${slot}`}
                      id={`slot_${slot}`}
                      className={twMerge(
                        'py-3 flex gap-2 items-end justify-center px-3',
                        isSaving && 'border-purple-500 animate-pulse'
                      )}
                      disabled={
                        !device || (!memoSlot && !isSaving) || move?.isDoing
                      }
                      onClick={() => (isSaving ? saveMemo(slot) : moveTo(slot))}
                    >
                      <FontAwesomeIcon
                        icon={
                          slot === 1
                            ? fa1
                            : slot === 2
                            ? fa2
                            : slot === 3
                            ? fa3
                            : fa4
                        }
                        size={'xl'}
                      />
                      <span className="text-sm text-zinc-400 whitespace-nowrap">
                        {memoSlot !== null && memoSlot > 0
                          ? posToCm(Number(memoSlot))
                          : 'unset'}
                      </span>
                    </Button>
                  );
                })}
              </ButtonGroup>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-zinc-400 uppercase text-sm font-bold flex flex-col text-center">
              options
            </h1>
            <div className="flex gap-2">
              <button
                className="text-neutral-400 flex gap-2 leading-none border border-neutral-600 px-5 py-2 rounded"
                onClick={() => setIsSaving()}
                disabled={!device}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                SAVE
              </button>
              <button
                onClick={() => setTimedMove((t) => !t)}
                className={twMerge(
                  'text-neutral-400 flex gap-2 leading-none border border-neutral-600 px-5 py-2 rounded',
                  timedMove && 'bg-white text-neutral-800'
                )}
              >
                <FontAwesomeIcon icon={timedMove ? faToggleOn : faToggleOff} />
                AUTO-MOVE
              </button>
              <div className="flex items-center gap-2">
                <input
                  className="outline-none border rounded px-2 py-2 border-neutral-600 leading-none  w-10 bg-transparent text-white focus:border-neutral-400 "
                  type="text"
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value ?? 0))}
                />
                <span className="text-white">min</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
