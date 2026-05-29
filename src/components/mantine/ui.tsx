"use client";

import * as React from "react";
import {
    Avatar as MantineAvatar,
    Badge as MantineBadge,
    Box,
    Button as MantineButton,
    ButtonProps as MantineButtonProps,
    Card as MantineCard,
    Checkbox as MantineCheckbox,
    Divider,
    Drawer,
    Menu,
    Modal,
    Skeleton as MantineSkeleton,
    Switch as MantineSwitch,
    Table as MantineTable,
    Tabs as MantineTabs,
    Textarea as MantineTextarea,
    TextInput,
} from "@mantine/core";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "subtle" | "light";
type Size = "default" | "sm" | "lg" | "icon" | string;

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    variant?: Variant;
    size?: Size;
    component?: React.ElementType;
    href?: string;
    asChild?: boolean;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
};

function buttonVariant(variant?: Variant): MantineButtonProps["variant"] {
    switch (variant) {
        case "outline":
            return "outline";
        case "ghost":
            return "subtle";
        case "secondary":
            return "light";
        case "destructive":
            return "filled";
        case "subtle":
            return "subtle";
        case "light":
            return "light";
        default:
            return "filled";
    }
}

function buttonColor(variant?: Variant) {
    return variant === "destructive" ? "red" : "alimenta";
}

function buttonSize(size?: Size): MantineButtonProps["size"] {
    if (size === "lg") return "md";
    if (size === "sm" || size === "icon") return "xs";
    return "sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {variant, size, className, children, asChild, ...props},
    ref,
) {
    if (asChild && React.isValidElement(children)) {
        const childProps = children.props as {className?: string};

        return React.cloneElement(children, {
            className: [childProps.className, className].filter(Boolean).join(" "),
            onClick: props.onClick,
        } as Record<string, unknown>);
    }

    const iconProps = size === "icon" ? {px: 0, w: 34, h: 34} : {};
    const MantineButtonComponent = MantineButton as React.ElementType;

    return (
        <MantineButtonComponent
            ref={ref}
            variant={buttonVariant(variant)}
            color={buttonColor(variant)}
            size={buttonSize(size)}
            className={className}
            {...iconProps}
            {...props}
        >
            {children}
        </MantineButtonComponent>
    );
});

type CardProps = React.PropsWithChildren<{className?: string} & Record<string, unknown>>;

export function Card({className, children, ...props}: CardProps) {
    const MantineCardComponent = MantineCard as React.ElementType;

    return (
        <MantineCardComponent className={["app-card", className].filter(Boolean).join(" ")} {...props}>
            {children}
        </MantineCardComponent>
    );
}

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = ({className, ...props}: DivProps) => (
    <Box className={className} px="md" pt="md" {...props} />
);
export const CardContent = ({className, ...props}: DivProps) => (
    <Box className={className} p="md" {...props} />
);
export const CardFooter = ({className, ...props}: DivProps) => (
    <Box className={className} px="md" pb="md" {...props} />
);
export const CardTitle = ({className, ...props}: React.ComponentProps<"h3">) => (
    <h3 className={className} {...props} />
);
export const CardDescription = ({className, ...props}: React.ComponentProps<"p">) => (
    <p className={className} {...props} />
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "outline" | "destructive" | "light" | "filled";
    color?: string;
};

export function Badge({variant = "light", color, ...props}: BadgeProps) {
    const MantineBadgeComponent = MantineBadge as React.ElementType;

    return (
        <MantineBadgeComponent
            variant={variant === "secondary" ? "light" : variant === "outline" ? "outline" : "light"}
            color={color ?? (variant === "destructive" ? "red" : "alimenta")}
            radius="sm"
            tt="none"
            {...props}
        />
    );
}

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof TextInput>>(function Input(
    props,
    ref,
) {
    return <TextInput ref={ref} {...props} />;
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof MantineTextarea>>(
    function Textarea(props, ref) {
        return <MantineTextarea ref={ref} {...props} />;
    },
);

export const Label = ({className, ...props}: React.ComponentProps<"label">) => (
    <label className={className} {...props} />
);

export const Separator = ({className, ...props}: React.ComponentProps<typeof Divider>) => (
    <Divider className={className} {...props} />
);

type SwitchProps = Omit<React.ComponentProps<typeof MantineSwitch>, "onChange"> & {
    onCheckedChange?: (checked: boolean) => void;
};

export function Switch({onCheckedChange, ...props}: SwitchProps) {
    return <MantineSwitch {...props} onChange={(event) => onCheckedChange?.(event.currentTarget.checked)} />;
}

type CheckboxProps = Omit<React.ComponentProps<typeof MantineCheckbox>, "onChange"> & {
    onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({onCheckedChange, ...props}: CheckboxProps) {
    return <MantineCheckbox {...props} onChange={(event) => onCheckedChange?.(event.currentTarget.checked)} />;
}

export const Skeleton = MantineSkeleton;

export const Table = ({children, ...props}: React.TableHTMLAttributes<HTMLTableElement>) => (
    <MantineTable {...props}>{children}</MantineTable>
);
export const TableHeader = ({children, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <MantineTable.Thead {...props}>{children}</MantineTable.Thead>
);
export const TableBody = ({children, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <MantineTable.Tbody {...props}>{children}</MantineTable.Tbody>
);
export const TableRow = ({children, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => (
    <MantineTable.Tr {...props}>{children}</MantineTable.Tr>
);
export const TableHead = ({children, ...props}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <MantineTable.Th {...props}>{children}</MantineTable.Th>
);
export const TableCell = ({children, ...props}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <MantineTable.Td {...props}>{children}</MantineTable.Td>
);

export const Tabs = MantineTabs;
export const TabsList = MantineTabs.List;
export const TabsTrigger = MantineTabs.Tab;
export const TabsContent = MantineTabs.Panel;

export const Avatar = MantineAvatar;
export const AvatarFallback = ({className, ...props}: React.ComponentProps<"span">) => (
    <span className={className} {...props} />
);

type DisclosureContextValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DisclosureContextValue | null>(null);
const SheetContext = React.createContext<DisclosureContextValue | null>(null);
const AlertContext = React.createContext<DisclosureContextValue | null>(null);

function useDisclosureContext(context: React.Context<DisclosureContextValue | null>) {
    const value = React.useContext(context);
    if (!value) {
        throw new Error("Disclosure component must be rendered inside its root.");
    }
    return value;
}

type RootProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
};

export function Dialog({open = false, onOpenChange, children}: RootProps) {
    return (
        <DialogContext.Provider value={{open, setOpen: (nextOpen) => onOpenChange?.(nextOpen)}}>
            {children}
        </DialogContext.Provider>
    );
}

export function DialogTrigger({asChild, children}: {asChild?: boolean; children: React.ReactElement}) {
    const {setOpen} = useDisclosureContext(DialogContext);
    if (asChild) {
        return React.cloneElement(children, {onClick: () => setOpen(true)} as Record<string, unknown>);
    }

    return <Button onClick={() => setOpen(true)}>{children}</Button>;
}

export function DialogContent({className, children}: {className?: string; children: React.ReactNode}) {
    const {open, setOpen} = useDisclosureContext(DialogContext);
    return (
        <Modal opened={open} onClose={() => setOpen(false)} centered size="lg" className={className}>
            {children}
        </Modal>
    );
}

export const DialogHeader = ({className, ...props}: React.ComponentProps<"div">) => (
    <div className={className} {...props} />
);
export const DialogTitle = ({className, ...props}: React.ComponentProps<"h2">) => (
    <h2 className={className} {...props} />
);
export const DialogDescription = ({className, ...props}: React.ComponentProps<"p">) => (
    <p className={className} {...props} />
);

export function Sheet({open = false, onOpenChange, children}: RootProps) {
    return (
        <SheetContext.Provider value={{open, setOpen: (nextOpen) => onOpenChange?.(nextOpen)}}>
            {children}
        </SheetContext.Provider>
    );
}

export function SheetTrigger({asChild, children}: {asChild?: boolean; children: React.ReactElement}) {
    const {setOpen} = useDisclosureContext(SheetContext);
    if (asChild) {
        return React.cloneElement(children, {onClick: () => setOpen(true)} as Record<string, unknown>);
    }

    return <Button onClick={() => setOpen(true)}>{children}</Button>;
}

export function SheetContent({
    side = "left",
    className,
    children,
}: {
    side?: "left" | "right" | "top" | "bottom";
    className?: string;
    children: React.ReactNode;
}) {
    const {open, setOpen} = useDisclosureContext(SheetContext);
    return (
        <Drawer opened={open} onClose={() => setOpen(false)} position={side} size={260} className={className}>
            {children}
        </Drawer>
    );
}

export const SheetHeader = ({className, ...props}: React.ComponentProps<"div">) => (
    <div className={className} {...props} />
);
export const SheetTitle = ({className, ...props}: React.ComponentProps<"h2">) => (
    <h2 className={className} {...props} />
);

export const DropdownMenu = Menu;
export const DropdownMenuTrigger = ({children}: {asChild?: boolean; children: React.ReactElement}) => (
    <Menu.Target>{children}</Menu.Target>
);
export const DropdownMenuContent = ({children}: {align?: string; className?: string; children: React.ReactNode}) => (
    <Menu.Dropdown>{children}</Menu.Dropdown>
);
export const DropdownMenuItem = ({asChild, children, onSelect, ...props}: {
    asChild?: boolean;
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
}) => {
    const MenuItem = Menu.Item as React.ElementType;

    if (asChild && React.isValidElement(children)) {
        return <MenuItem component={children.type} {...(children.props as Record<string, unknown>)} />;
    }

    return <MenuItem onClick={onSelect} {...props}>{children}</MenuItem>;
};
export const DropdownMenuLabel = Menu.Label;
export const DropdownMenuSeparator = Menu.Divider;

export function AlertDialog({open = false, onOpenChange, children}: RootProps) {
    return (
        <AlertContext.Provider value={{open, setOpen: (nextOpen) => onOpenChange?.(nextOpen)}}>
            {children}
        </AlertContext.Provider>
    );
}

export function AlertDialogContent({children}: {children: React.ReactNode}) {
    const {open, setOpen} = useDisclosureContext(AlertContext);
    return (
        <Modal opened={open} onClose={() => setOpen(false)} centered size="sm">
            {children}
        </Modal>
    );
}

export const AlertDialogHeader = ({className, ...props}: React.ComponentProps<"div">) => (
    <div className={className} {...props} />
);
export const AlertDialogTitle = ({className, ...props}: React.ComponentProps<"h2">) => (
    <h2 className={className} {...props} />
);
export const AlertDialogDescription = ({className, ...props}: React.ComponentProps<"p">) => (
    <p className={className} {...props} />
);
export const AlertDialogFooter = ({className, ...props}: React.ComponentProps<"div">) => (
    <div className={className} {...props} />
);
export const AlertDialogCancel = ({children}: {children: React.ReactNode}) => {
    const {setOpen} = useDisclosureContext(AlertContext);
    return <Button variant="outline" onClick={() => setOpen(false)}>{children}</Button>;
};
export const AlertDialogAction = ({children, onClick, className}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) => (
    <Button variant="destructive" className={className} onClick={onClick}>
        {children}
    </Button>
);
