/**
 * Account page component
 * @file User account page with profile information and social account connections
 */

import { Metadata } from "next";
import { AccountContent } from "./account-content";

export const metadata: Metadata = {
    title: "Account",
    description: "A place to manage your account and settings",
}

export default function AccountPage() {
    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Page header */}
            <div className="border-b border-sidebar-accent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-8 h-14 flex items-center w-full">
                    <h1 className="text-lg font-medium">Account</h1>
                </div>
            </div>

            {/* Page content */}
            <AccountContent />
        </div>
    )
}