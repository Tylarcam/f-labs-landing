# Fix Workflow: `handleNodeStatusChange` ReferenceError in GameDemoDisplay.tsx

## Problem

- **Error:**
  - `ReferenceError: Cannot access 'handleNodeStatusChange' before initialization`
  - Linter: `Block-scoped variable 'handleNodeStatusChange' used before its declaration.`
- **Where:**
  - In the `GameDemoDisplay` React component, when passing `handleNodeStatusChange` to the `useThreats` hook.

## Diagnosis

- In JavaScript/TypeScript, you cannot use a variable (including a function) before it is declared in the same scope.
- In React, all hooks and variables that are used as dependencies or arguments in other hooks must be declared **before** their first use.
- The error occurred because `handleNodeStatusChange` was being passed to `useThreats` before it was defined.

## Solution / Workflow

1. **Identify the order of declarations:**
   - Find where `handleNodeStatusChange` is defined and where it is first used (in this case, as an argument to `useThreats`).
2. **Move the function definition:**
   - Move the definition of `handleNodeStatusChange` **above** the `useThreats` hook call.
3. **Check dependencies:**
   - Ensure all state/hooks used inside `handleNodeStatusChange` are declared before the function itself.
4. **Test:**
   - Rebuild and run the app to confirm the ReferenceError and linter errors are resolved.

## Example Fix

```tsx
// 1. Declare all state/hooks needed by handleNodeStatusChange
const { networkNodes, setNetworkNodes } = useNetworkNodes(isWhiteHat, isTransitioning);
// ...other state...

// 2. Define handleNodeStatusChange
const handleNodeStatusChange = useCallback((nodeId, previousStatus, currentStatus) => {
  // ...function body...
}, [/* dependencies */]);

// 3. Now use it in useThreats
const { threats } = useThreats(isWhiteHat, networkNodes, handleNodeStatusChange);
```

## Prompts/Questions Used

- What is the error and where does it occur?
- Why does this error happen in React/TypeScript?
- How should the code be rearranged to fix the error?
- What is the correct order for hook and function declarations in a React component?

## Summary

- **Root cause:** Using a function before it is declared.
- **Solution:** Move the function definition above its first use.
- **Result:** No more ReferenceError or linter issues; app builds and runs as expected. 