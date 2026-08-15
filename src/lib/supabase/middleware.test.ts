import test from "node:test";
import assert from "node:assert/strict";
import { isProtectedRoute, isPublicRoute } from "@/lib/supabase/middleware";

test("treats guest-facing routes as public", () => {
    assert.equal(isPublicRoute("/login"), true);
    assert.equal(isPublicRoute("/marketing"), true);
    assert.equal(isPublicRoute("/reset-password"), true);
    assert.equal(isPublicRoute("/spin/ABC123"), true);
});

test("does not mark authenticated routes as public", () => {
    assert.equal(isPublicRoute("/"), false);
    assert.equal(isPublicRoute("/history"), false);
    assert.equal(isPublicRoute("/settings"), false);
    assert.equal(isPublicRoute("/spin"), false);
});

test("protects authenticated application routes", () => {
    assert.equal(isProtectedRoute("/"), true);
    assert.equal(isProtectedRoute("/history"), true);
    assert.equal(isProtectedRoute("/log"), true);
    assert.equal(isProtectedRoute("/settings/preferences"), true);
    assert.equal(isProtectedRoute("/spin"), true);
    assert.equal(isProtectedRoute("/future-route"), true);
});

test("does not protect guest-facing routes", () => {
    assert.equal(isProtectedRoute("/login"), false);
    assert.equal(isProtectedRoute("/marketing"), false);
    assert.equal(isProtectedRoute("/reset-password"), false);
    assert.equal(isProtectedRoute("/spin/ABC123"), false);
});
