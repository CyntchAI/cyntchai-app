"use server";

import prisma from "@/lib/prisma";
import { actionClient, ActionResponse } from "@/lib/safe-action";
import { getUserData, verifyUser } from "./user";
import { EmbeddedWallet } from "@/types/db";
import { z } from "zod";
import { decryptPrivateKey } from "@/lib/solana/wallet-generator";
import { Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { createConnection } from "@/lib/solana";
export const listEmbeddedWallets = actionClient
    .action<ActionResponse<EmbeddedWallet[]>>(async () => {
        const authResult = await verifyUser();
        const userId = authResult?.data?.data?.id;

        if (!userId) {
            return {
                success: false,
                error: "Authentication failed"
            }
        }

        const wallets = await prisma.wallet.findMany({
            where: { ownerId: userId }
        });

        return {
            success: true,
            data: wallets
        }
    });

export const embeddedWalletSendSOL = actionClient
    .schema(z.object({
        walletId: z.string(),
        recipientAddress: z.string(),
        amount: z.number()
    }))
    .action<ActionResponse<string>>(async ({ parsedInput: { walletId, recipientAddress, amount } }) => {
        const authResult = await verifyUser();
        const userId = authResult?.data?.data?.id;

        if (!userId) {
            return {
                success: false,
                error: "Authentication failed"
            }
        }

        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId }
        });

        if (!wallet || wallet.ownerId !== userId) {
            return {
                success: false,
                error: "Wallet not found"
            }
        }

        try {
            const privateKey = await decryptPrivateKey(wallet.encryptedPrivateKey);
            const keyPair = Keypair.fromSecretKey(bs58.decode(privateKey));
            const recipientPublicKey = new PublicKey(recipientAddress);
            const connection = createConnection();
            const lamportsToSend = 1_000_000;

            const transferTransaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: keyPair.publicKey,
                    toPubkey: recipientPublicKey,
                    lamports: lamportsToSend,
                }),
            );

            const txHash = await sendAndConfirmTransaction(connection, transferTransaction, [keyPair]);

            return {
                success: true,
                data: txHash
            }
        } catch (error) {
            return {
                success: false,
                error: "Failed to send SOL (error: " + error + ")"
            }
        }
    }); 