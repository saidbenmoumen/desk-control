import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

type State = {
  overId: string | null;
  rects: {
    [key: string]: DOMRect;
  };
  measure: boolean;
};

const Context = React.createContext<{
  state: State;
  callbacks: {
    setRect: (id: string, rect: DOMRect) => void;
    setOverId: (id: string | null) => void;
    measure: () => void;
  };
}>({
  state: {
    overId: null,
    rects: {},
    measure: false,
  },
  callbacks: {
    setRect: () => {},
    setOverId: () => {},
    measure: () => {},
  },
});

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<Props> = ({
  children,
  className,
  ...props
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [state, dispatch] = React.useReducer<
    React.Reducer<State, { type: string; payload?: any | null }>
  >(
    (state, action) => {
      switch (action.type) {
        case 'SET_RECT':
          return {
            ...state,
            rects: {
              ...state.rects,
              [action.payload.id]: action.payload.rect,
            },
          };
        case 'SET_OVER_ID':
          return {
            ...state,
            overId: action.payload,
          };
        case 'MEASURE':
          return {
            ...state,
            measure: !state.measure,
          };
        default:
          return state;
      }
    },
    {
      overId: null,
      rects: {},
      measure: false,
    }
  );

  const callbacks = React.useMemo(
    () => ({
      setRect: (id: string, rect: DOMRect) => {
        dispatch({
          type: 'SET_RECT',
          payload: {
            id,
            rect,
          },
        });
      },
      setOverId: (id: string | null) => {
        dispatch({
          type: 'SET_OVER_ID',
          payload: id,
        });
      },
      measure: () => {
        dispatch({ type: 'MEASURE' });
      },
    }),
    [state]
  );

  useEffect(() => {
    window.addEventListener('resize', callbacks.measure);
    if (ref && ref.current) {
      ref.current.addEventListener('mouseleave', () => {
        dispatch({
          type: 'SET_OVER_ID',
          payload: null,
        });
      });
    }
    return () => {
      window.removeEventListener('resize', callbacks.measure);
    };
  }, [ref, ref.current]);

  const overRect = React.useMemo(
    () => (state.overId ? state.rects[state.overId] : null),
    [state.overId, state.rects]
  );

  return (
    <Context.Provider
      value={{
        state,
        callbacks,
      }}
    >
      <div
        ref={ref}
        className={twMerge(className, 'flex items-center gap-3')}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              measure: state.measure,
            });
          }
          return child;
        })}
        {overRect && (
          <span
            className={twMerge(
              `bg-neutral-700 opacity-100 rounded`,
              'transition-all ease-in-out duration-150'
            )}
            style={{
              position: 'absolute',
              top: overRect?.top ?? 0,
              left: overRect?.left ?? 0,
              width: overRect?.width ?? 0,
              height: overRect.height ?? 0,
            }}
          />
        )}
      </div>
    </Context.Provider>
  );
};

const useButton = ({ id, measure }: { id: string; measure: boolean }) => {
  const nodeRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    callbacks: { setRect, setOverId },
  } = React.useContext(Context);

  React.useEffect(() => {
    if (nodeRef && nodeRef.current && id) {
      nodeRef.current.addEventListener('mouseenter', () => setOverId(id));
    }
  }, [nodeRef, nodeRef.current]);

  React.useEffect(() => {
    if (nodeRef && nodeRef.current && id) {
      setRect(id, nodeRef.current.getBoundingClientRect());
    }
  }, [measure, nodeRef, nodeRef.current]);

  return {
    nodeRef,
  };
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  measure?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  measure,
  ...props
}) => {
  const { nodeRef } = useButton({
    id: props.id ?? '',
    measure: measure ?? false,
  });

  return (
    <button
      className={twMerge(
        'rounded py-3  min-w-[5rem] shadow-none hover:shadow-lg hover:shadow-[#313131] transition-all ease-in-out duration-150 border-2 border-neutral-700 relative z-10 flex items-center justify-center px-3 text-white font-semibold disabled:opacity-20',
        className
      )}
      ref={nodeRef}
      {...props}
    />
  );
};
