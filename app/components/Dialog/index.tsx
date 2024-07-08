"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const DialogContext = React.createContext<{ open: boolean }>({
  open: false,
});

const Dialog = ({ children, ...props }: DialogPrimitive.DialogProps) => {
  const open = React.useMemo(() => props.open || false, [props.open]);

  return (
    <DialogPrimitive.Root {...props}>
      <DialogContext.Provider value={{ open }}>
        {children}
      </DialogContext.Provider>
    </DialogPrimitive.Root>
  );
};

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <motion.div
    initial={{
      opacity: 0,
      backdropFilter: "blur(0px)",
    }}
    animate={{
      opacity: 1,
      backdropFilter: "blur(4px)",
    }}
    exit={{
      opacity: 0,
      backdropFilter: "blur(0px)",
      transition: { duration: 0.1 },
    }}
    transition={{ duration: 0.2 }}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
  >
    <DialogPrimitive.Overlay
      ref={ref}
      {...props}
    />
  </motion.div>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(DialogContext);

  return (
    <AnimatePresence>
      {open ? (
        <DialogPortal forceMount>
          <DialogOverlay />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 grid w-full gap-4 rounded-b-lg border bg-custom p-6 shadow-lg sm:max-w-xl sm:rounded-lg",
              className,
            )}
          >
            <DialogPrimitive.Content
              ref={ref}
              {...props}
            >
              {children}
              <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm bg-transparent text-custom opacity-70 outline-none transition-opacity hover:opacity-100 disabled:pointer-events-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </motion.div>
        </DialogPortal>
      ) : null}
    </AnimatePresence>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
