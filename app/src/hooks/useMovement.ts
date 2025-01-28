import { useCallback, useEffect, useRef, useState } from "react";
import { AccountInterface } from "starknet";
import { useDojoSDK } from "@dojoengine/sdk/react";

interface MovementProps {
    account: AccountInterface | null;
    localPosition: { x: number; y: number };
    setLocalPosition: (position: { x: number; y: number }) => void;
    setLocalRotation: (rotation: number) => void;
}

export const useMovement = ({
    account,
    localPosition,
    setLocalPosition,
    setLocalRotation
}: MovementProps) => {
    const { client } = useDojoSDK();
    const [localRotationState, setLocalRotationState] = useState(0);

    const keysPressed = useRef<Set<string>>(new Set());
    const animationFrameRef = useRef<number>();
    const lastValidationRef = useRef<number>(Date.now());
    const VALIDATION_INTERVAL = 5000;

    const updateMovement = useCallback(() => {
        if (!account) return;

        let newX = localPosition.x;
        let newY = localPosition.y;
        let newRotation = localRotationState;

        const moveSpeed = 0.2;
        const rotationSpeed = 6;

        // WASD movement
        if (keysPressed.current.has("w")) {
            newY = Math.max(0, newY - moveSpeed);
        }
        if (keysPressed.current.has("s")) {
            newY = Math.min(11, newY + moveSpeed);
        }
        if (keysPressed.current.has("a")) {
            newX = Math.max(0, newX - moveSpeed);
        }
        if (keysPressed.current.has("d")) {
            newX = Math.min(17, newX + moveSpeed);
        }

        // Arrow-based rotation
        if (keysPressed.current.has("ArrowRight")) {
            newRotation = (newRotation + rotationSpeed) % 360;
        }
        if (keysPressed.current.has("ArrowLeft")) {
            newRotation = (newRotation - rotationSpeed + 360) % 360;
        }

        const positionChanged = newX !== localPosition.x || newY !== localPosition.y;
        const rotationChanged = newRotation !== localRotationState;

        if (positionChanged) {
            console.log("Updating position:", newX, newY); // Debug log

            setLocalPosition({ x: newX, y: newY });
        }
        
        if (rotationChanged) {
            setLocalRotationState(newRotation);
            setLocalRotation(newRotation);
        }

        // Only validate position on-chain
        const now = Date.now();
        if (positionChanged && now - lastValidationRef.current >= VALIDATION_INTERVAL) {
            client.actions.validatePosition(
                account,
                1,
                Math.round(newX),
                Math.round(newY),
                localRotationState
            ).catch((error: Error) => {
                console.error("Error validating position:", error);
            });

            lastValidationRef.current = now;
        }

        animationFrameRef.current = requestAnimationFrame(updateMovement);
    }, [
        account,
        localPosition,
        localRotationState,
        setLocalPosition,
        setLocalRotation,
        client.actions
    ]);


    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const key = event.key;
        event.preventDefault(); // Add this line to prevent default behavior
    
        if (["w", "a", "s", "d", "ArrowLeft", "ArrowRight"].includes(key)) {
            keysPressed.current.add(key);
            if (!animationFrameRef.current) {
                animationFrameRef.current = requestAnimationFrame(updateMovement);
            }
        }
    }, [updateMovement]);
    

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        const key = event.key;

        keysPressed.current.delete(key);
        
        // Only cancel if ALL keys are released
        if (keysPressed.current.size === 0) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = undefined;
            }
        }
    }, []);
    

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        if (keysPressed.current.size > 0 && !animationFrameRef.current) {
            animationFrameRef.current = requestAnimationFrame(updateMovement);
        }
    }, [updateMovement]);
};
