"use client";

import {Text as MantineText, type PolymorphicComponentProps, type TextProps} from "@mantine/core";

type AppTextProps = PolymorphicComponentProps<"p", TextProps>;

export const Text = ({className, ...props}: AppTextProps) => (
    <MantineText className={className} {...props} />
);
