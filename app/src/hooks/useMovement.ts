import { useCallback, useEffect, useState, useRef } from 'react';
import { AccountInterface } from 'starknet';
import { useDojoSDK } from '@dojoengine/sdk/react';

interface MovementProps {
    account: AccountInterface | null;
    localPosition: { x: number, y: number };
    setLocalPosition: (position: { x: number, y: number }) => void;
    tankRotation: number;
}

export const useMovement = ({ account, localPosition, setLocalPosition, tankRotation }: MovementProps) => {
    const { client } = useDojoSDK();
    const [targetPosition, setTargetPosition] = useState(localPosition);
    const animationFrameRef = useRef<number>();
    const lastUpdateRef = useRef<number>(Date.now());

    const interpolatePosition = useCallback(() => {
        const now = Date.now();
        const deltaTime = (now - lastUpdateRef.current) / 1000;
        lastUpdateRef.current = now;

        const interpolationSpeed = 1.2; // Adjust for faster/slower movement
        const epsilon = 0.01; // Threshold for considering movement complete

        const dx = targetPosition.x - localPosition.x;
        const dy = targetPosition.y - localPosition.y;

        if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon) {
            return;
        }

        const newX = localPosition.x + dx * interpolationSpeed * deltaTime;
        const newY = localPosition.y + dy * interpolationSpeed * deltaTime;

        setLocalPosition({ x: newX, y: newY });

        animationFrameRef.current = requestAnimationFrame(interpolatePosition);
    }, [localPosition, targetPosition, setLocalPosition]);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (!account || event.repeat) return;

        let newX = targetPosition.x;
        let newY = targetPosition.y;

        switch (event.key.toLowerCase()) {
            case 'w':
                newY = Math.max(0, targetPosition.y - 1);
                break;
            case 's':
                newY = Math.min(11, targetPosition.y + 1);
                break;
            case 'a':
                newX = Math.max(0, targetPosition.x - 1);
                break;
            case 'd':
                newX = Math.min(17, targetPosition.x + 1);
                break;
            default:
                return;
        }

        setTargetPosition({ x: newX, y: newY });

        client.actions.validatePosition(
            account,
            1, // gameId
            Math.round(newX),
            Math.round(newY),
            tankRotation
        ).catch((error: Error) => {
            console.error("Error validating position:", error);
            // Revert to last valid position on error
            setTargetPosition(localPosition);
        });
    }, [targetPosition, account, client.actions, tankRotation, localPosition]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [handleKeyPress]);

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(interpolatePosition);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [interpolatePosition]);
};
