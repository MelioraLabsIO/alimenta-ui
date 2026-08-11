import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function SharedLayout({ children }: Props) {
    return <main className="min-h-screen">{children}</main>;
}
