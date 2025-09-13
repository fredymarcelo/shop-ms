"use client";

import {type ReactNode, useCallback, useEffect, useState} from "react";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import {CircleAlertIcon, CircleCheckBigIcon, CircleHelpIcon, CircleXIcon, InfoIcon, LoaderCircleIcon} from "lucide-react";

export type DialogType = "success" | "info" | "warning" | "error" | "question";

const ANIMATION_DURATION = 200;


class AlertDialogChannel {
  
  private listener?: AlertInvocation;
  
  public listen(callback: AlertInvocation): () => void {
    this.listener = callback;
    return this.off;
  }
  
  public off(): void {
    this.listener = undefined;
  }
  
  public send<TConfirm, TCancel>(options: AlertDialogOptions<TConfirm, TCancel>): Promise<DialogResult<TConfirm, TCancel>> {
    if (!this.listener) {
      throw new Error("AlertDialogChannel not initialized");
    }
    return this.listener(options);
  }
}

const channel = new AlertDialogChannel();

export type DialogResult<TConfirm, TCancel> = ConfirmResult<TConfirm> | CancelResult<TCancel>;

type ConfirmResult<T> = {
  isConfirmed: true;
  isCancelled: false;
  value: T;
}

type CancelResult<T> = {
  isConfirmed: false;
  isCancelled: true;
  value: T;
}

function confirm<TConfirm>(value: TConfirm): ConfirmResult<TConfirm> {
  return {
    isConfirmed: true,
    isCancelled: false,
    value,
  };
}

function cancel<TCancel>(value: TCancel): CancelResult<TCancel> {
  return {
    isConfirmed: false,
    isCancelled: true,
    value,
  };
}

type OnDialogAction<T> = T | (() => (Promise<T> | T))

type AlertDialogBaseOptions<TConfirm = void, TCancel = void> = {
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  confirmButton?: boolean;
  cancelButton?: boolean;
  onConfirm?: OnDialogAction<TConfirm>;
  onCancel?: OnDialogAction<TCancel>;
};

export type AlertDialogOptions<TConfirm = void, TCancel = void> = {
  type: DialogType;
} & AlertDialogBaseOptions<TConfirm, TCancel>;


function mixinWithDefaultOptions<TConfirm, TCancel>(options: AlertDialogOptions<TConfirm, TCancel>): AlertDialogOptions<TConfirm, TCancel> {
  const type = options.type;
  
  if (type === "success") {
    return {
      ...options,
      icon: options.icon ?? <CircleCheckBigIcon/>,
      confirmButton: options.confirmButton ?? true,
      cancelButton: options.cancelButton ?? false,
    };
  }
  
  if (type === "info") {
    return {
      ...options,
      icon: options.icon ?? <InfoIcon/>,
      confirmButton: options.confirmButton ?? true,
      cancelButton: options.cancelButton ?? false,
    };
  }
  
  if (type === "warning") {
    return {
      ...options,
      icon: options.icon ?? <CircleAlertIcon/>,
      confirmButton: options.confirmButton ?? true,
      cancelButton: options.cancelButton ?? false,
    };
  }
  
  if (type === "error") {
    return {
      ...options,
      icon: options.icon ?? <CircleXIcon/>,
      confirmButton: options.confirmButton ?? true,
      cancelButton: options.cancelButton ?? false,
    };
  }
  
  if (type === "question") {
    return {
      ...options,
      icon: options.icon ?? <CircleHelpIcon/>,
      confirmButton: options.confirmButton ?? true,
      cancelButton: options.cancelButton ?? true,
    };
  }
  
  throw new Error(`Unknown alert dialog type: ${type}`);
}

type AlertInvocation = <TConfirm = void, TCancel = void>(options: AlertDialogOptions<TConfirm, TCancel>) => Promise<DialogResult<TConfirm, TCancel>>;

type AlertMethod = <TConfirm = void, TCancel = void>(options: AlertDialogBaseOptions<TConfirm, TCancel>) => Promise<DialogResult<TConfirm, TCancel>>;

export type AlertMethods = {
  readonly success: AlertMethod;
  readonly info: AlertMethod;
  readonly warning: AlertMethod;
  readonly error: AlertMethod;
  readonly question: AlertMethod;
}

export type Alert = AlertInvocation & AlertMethods;

export const alert: Alert = Object.freeze(Object.assign<AlertInvocation, AlertMethods>(
  channel.send,
  {
    success: props => channel.send({...props, type: "success"}),
    info: props => channel.send({...props, type: "info"}),
    warning: props => channel.send({...props, type: "warning"}),
    error: props => channel.send({...props, type: "error"}),
    question: props => channel.send({...props, type: "question"}),
  }
));

type Actions = "confirm" | "cancel";

type Dialog<TConfirm, TCancel> = {
  id: string;
  options: AlertDialogOptions<TConfirm, TCancel>;
  closing: boolean;
  loading: Actions[];
  promise: {
    resolve: (result: DialogResult<TConfirm, TCancel>) => void,
    reject: (reason?: unknown) => void
  };
};

function generateId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(7);
}

function getActionOption<TConfirm, TCancel>(options: AlertDialogOptions<TConfirm, TCancel>, action: Actions): {
  onAction?: OnDialogAction<unknown>,
  getResult: (value: unknown) => DialogResult<TConfirm, TCancel>
} {
  switch (action) {
    case "confirm":
      return {
        onAction: options.onConfirm,
        getResult: value => confirm(value as TConfirm),
      };
    case "cancel":
      return {
        onAction: options.onCancel,
        getResult: value => cancel(value as TCancel),
      };
  }
}

export const AlertDialogs = () => {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dialogs, setDialogs] = useState<Dialog<any, any>[]>([]);
  
  const close = useCallback((dialogId: string) => {
    setDialogs(prev => prev.map(dialog =>
      dialog.id === dialogId ? {...dialog, closing: true} : dialog
    ));
    setTimeout(() => {
      setDialogs(prev => prev.filter(dialog => dialog.id !== dialogId));
    }, ANIMATION_DURATION);
    
  }, []);
  
  const setLoadingState = useCallback((
    dialogId: string,
    action: Actions,
    enable: boolean
  ) => {
    setDialogs(prev => prev.map(dialog => {
      if (dialog.id !== dialogId) return dialog;
      const alreadyPresent = dialog.loading.includes(action);
      if (enable && !alreadyPresent) {
        return {...dialog, loading: [...dialog.loading, action],};
      }
      if (!enable && alreadyPresent) {
        return {...dialog, loading: dialog.loading.filter(a => a !== action),};
      }
      return dialog;
    }));
  }, []);
  
  
  const handleAction = useCallback<<TConfirm, TCancel>(dialog: Dialog<TConfirm, TCancel>, action: Actions) => void>(async (dialog, action) => {
    const options = dialog.options;
    const {resolve, reject} = dialog.promise;
    
    const opt = getActionOption(options, action);
    
    if (!opt.onAction) {
      close(dialog.id);
      resolve(opt.getResult(undefined));
      return;
    }
    
    try {
      const result = typeof opt.onAction === "function" ? opt.onAction() : opt.onAction;
      if (result instanceof Promise) {
        setLoadingState(dialog.id, action, true);
        resolve(opt.getResult(await result));
      } else {
        resolve(opt.getResult(result));
      }
      close(dialog.id)
    } catch (error) {
      reject(error);
      close(dialog.id);
    } finally {
      setLoadingState(dialog.id, action, false);
    }
  }, [setLoadingState, close]);
  
  
  useEffect(() => channel.listen(<TConfirm, TCancel>(options: AlertDialogOptions<TConfirm, TCancel>) => {
    const id = generateId();
    return new Promise((resolve: (value: DialogResult<TConfirm, TCancel>) => void, reject) => {
      const dialog: Dialog<TConfirm, TCancel> = {
        id,
        options: mixinWithDefaultOptions(options),
        closing: false,
        loading: [],
        promise: {resolve, reject},
      };
      setDialogs(prev => [...prev, dialog]);
    });
  }), []);
  
  return <>{dialogs.map((dialog) => (
    <AlertDialogItem
      key={dialog.id}
      dialog={dialog}
      handleAction={action => handleAction(dialog, action)}
    />
  ))}</>;
};

function AlertDialogItem<TConfirm, TCancel>({dialog, handleAction}: Readonly<{
  dialog: Dialog<TConfirm, TCancel>;
  handleAction: (action: Actions) => void;
}>) {
  
  const options = dialog.options;
  const loading = dialog.loading.length > 0;
  const isLoading = (action: Actions) => dialog.loading.includes(action);
  
  return (
    <AlertDialog open={!dialog.closing}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center">
            {options.icon && <span className="mr-2">{options.icon}</span>}
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {options.cancelButton && (
            <AlertDialogCancel
              onClick={() => handleAction("cancel")}
              disabled={loading}
            >
              {isLoading("cancel") && <LoaderCircleIcon className="animate-spin mr-2"/>}
              Cancelar
            </AlertDialogCancel>
          )}
          {options.confirmButton && <AlertDialogAction
            onClick={() => handleAction("confirm")}
            disabled={loading}
          >
            {isLoading("confirm") && <LoaderCircleIcon className="animate-spin mr-2"/>}
            {options.type === "question" ? "Aceptar" : "Ok"}
          </AlertDialogAction>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
