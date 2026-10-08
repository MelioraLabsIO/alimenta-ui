"use client";

import Link from "next/link";
import {
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { ArrowRight, BarChart2, Leaf, Zap } from "lucide-react";
import { Brand } from "@/components/layout/Brand";

const FEATURES = [
    {
        icon: Leaf,
        color: "alimenta",
        title: "Smart Meal Logging",
        desc: "Log meals manually or just describe them in plain English — Alimenta parses the rest.",
    },
    {
        icon: BarChart2,
        color: "sky",
        title: "Trend Insights",
        desc: "See how your food choices correlate with mood, energy, and digestion over time.",
    },
    {
        icon: Zap,
        color: "amber",
        title: "Personalized Patterns",
        desc: "Discover your top foods, consistency streaks, and what to eat more (or less) of.",
    },
] as const;

export default function LandingPage() {
    return (
        <Box
            component="main"
            mih="100dvh"
            c="var(--tx)"
            style={{
                background: "var(--wash)",
                backgroundAttachment: "fixed",
            }}
        >
            <Container size={1100} px={{ base: "lg", md: "xl" }} py="xl">
                <Stack gap="xxl">
                    {/* Nav */}
                    <Group
                        component="nav"
                        justify="space-between"
                        align="center"
                        wrap="nowrap"
                    >
                        <Brand href="/" />
                        <Button component={Link} href="/login" size="sm">
                            Sign In
                        </Button>
                    </Group>

                    {/* Hero */}
                    <Paper
                        component="section"
                        radius="xxl"
                        px={{ base: "xl", md: 48 }}
                        py={{ base: 56, md: 88 }}
                        shadow="none"
                        withBorder={false}
                        c="white"
                        style={{
                            background:
                                "linear-gradient(120deg, color-mix(in srgb, var(--ac) 88%, #000), color-mix(in srgb, var(--bl) 80%, #000))",
                            position: "relative",
                            overflow: "hidden",
                            animation: "alm-in 500ms var(--motion-spring) both",
                        }}
                    >
                        <Box
                            pos="absolute"
                            right={-60}
                            top={-100}
                            w={320}
                            h={320}
                            style={{
                                borderRadius: "var(--mantine-radius-pill)",
                                background: "rgba(255,255,255,0.12)",
                                pointerEvents: "none",
                            }}
                        />
                        <Box
                            pos="absolute"
                            left={-120}
                            bottom={-160}
                            w={360}
                            h={360}
                            style={{
                                borderRadius: "var(--mantine-radius-pill)",
                                background: "rgba(255,255,255,0.08)",
                                pointerEvents: "none",
                            }}
                        />

                        <Stack
                            align="center"
                            ta="center"
                            gap="xl"
                            pos="relative"
                            maw={760}
                            mx="auto"
                        >
                            <Badge
                                variant="outline"
                                c="white"
                                style={{
                                    borderColor: "rgba(255,255,255,0.4)",
                                    background: "rgba(255,255,255,0.14)",
                                }}
                            >
                                Food + Wellness Discovery
                            </Badge>

                            <Title
                                order={1}
                                fz={{ base: "display", md: 68 }}
                                fw={700}
                                lh={1.05}
                                style={{ letterSpacing: "var(--ls-snug)" }}
                            >
                                Eat well.{" "}
                                <Text span inherit c="rgba(255,255,255,0.78)">
                                    Feel better.
                                </Text>
                            </Title>

                            <Text
                                fz={{ base: "lg", md: 19 }}
                                lh="lg"
                                maw={620}
                                style={{ opacity: 0.88 }}
                            >
                                Alimenta helps you discover which foods fuel
                                your mood, energy, and digestion — not just
                                count calories. Log meals, spot patterns, and
                                build a diet that actually works for you.
                            </Text>

                            <Group gap="sm" justify="center">
                                <Button
                                    component={Link}
                                    href="/login"
                                    size="lg"
                                    bg="white"
                                    c="var(--ink-on-gradient)"
                                    rightSection={<ArrowRight size={16} />}
                                    style={{
                                        boxShadow:
                                            "0 14px 34px rgba(0,0,0,0.25)",
                                    }}
                                >
                                    Get Started
                                </Button>
                                <Button
                                    size="lg"
                                    variant="default"
                                    c="white"
                                    style={{
                                        borderColor: "rgba(255,255,255,0.45)",
                                    }}
                                >
                                    Learn more
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>

                    {/* Features */}
                    <SimpleGrid
                        component="section"
                        cols={{ base: 1, md: 3 }}
                        spacing="md"
                    >
                        {FEATURES.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <Paper
                                    key={feature.title}
                                    radius="xl"
                                    p="xl"
                                    withBorder
                                >
                                    <Stack gap="md">
                                        <ThemeIcon
                                            size={40}
                                            radius="md"
                                            color={feature.color}
                                        >
                                            <Icon size={19} />
                                        </ThemeIcon>
                                        <Text fw={700} fz="lg">
                                            {feature.title}
                                        </Text>
                                        <Text fz="md" c="var(--tx2)" lh="lg">
                                            {feature.desc}
                                        </Text>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </SimpleGrid>

                    {/* Footer */}
                    <Box component="footer">
                        <Divider mb="xl" />
                        <Text ta="center" fz="xs" c="var(--tx3)">
                            © {new Date().getFullYear()} Alimenta. Built for
                            your wellbeing.
                        </Text>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
