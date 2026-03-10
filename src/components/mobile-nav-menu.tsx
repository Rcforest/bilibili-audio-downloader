'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Github, HelpCircle, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ChangelogDialog } from '@/components/changelog-dialog'
import type { Locale } from '@/lib/i18n/config'
import type { HomeDictionary } from '@/lib/i18n/types'

interface MobileNavMenuProps {
    locale: Locale
    dict: HomeDictionary
    defaultOpen?: boolean
}

export function MobileNavMenu({
    locale,
    dict,
    defaultOpen = false,
}: MobileNavMenuProps) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={dict.page.openMenuLabel}>
                    <Menu className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="top-auto bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-sm translate-x-[-50%] translate-y-0 rounded-xl p-4">
                <DialogHeader>
                    <DialogTitle className="text-base">{dict.unified.pageTitle}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                        <a
                            href="https://github.com/lxw15337674/galaxy-downloader"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                        >
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                        </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href={`/${locale}/faq`} prefetch={false} onClick={() => setOpen(false)}>
                            <HelpCircle className="h-4 w-4" />
                            <span>{dict.page.faqLinkText}</span>
                        </Link>
                    </Button>
                    <ChangelogDialog
                        locale={locale}
                        dict={dict}
                        triggerClassName="w-full justify-start"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
