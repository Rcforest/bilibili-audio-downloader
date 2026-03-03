'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/types'
import type { FeedbackType } from '@/lib/feedback-config'
import { submitFeedback, validateContent, validateEmail } from '@/lib/feedback'
import { FEEDBACK_CONFIG } from '@/lib/feedback-config'
import { cn } from '@/lib/utils'

interface FeedbackDialogProps {
    locale: Locale
    dict: Dictionary
    triggerClassName?: string
    triggerIconOnly?: boolean
    onTriggerClick?: () => void
}

export function FeedbackDialog({ locale, dict, triggerClassName, triggerIconOnly = false, onTriggerClick }: FeedbackDialogProps) {
    const [open, setOpen] = useState(false)
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug')
    const [content, setContent] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // 字符计数
    const contentLength = content.length
    const maxLength = FEEDBACK_CONFIG.validation.contentMaxLength

    // 验证状态
    const contentError = content ? validateContent(content) : null
    const emailError = email ? !validateEmail(email) : null
    const canSubmit = !contentError && !emailError && content.trim().length >= FEEDBACK_CONFIG.validation.contentMinLength && validateEmail(email)

    // 获取当前反馈类型对应的placeholder
    const getPlaceholder = () => {
        if (!dict.feedback?.contentPlaceholder) return ''
        return dict.feedback.contentPlaceholder[feedbackType] || dict.feedback.contentPlaceholder.other || ''
    }

    // 重置表单
    const resetForm = () => {
        setFeedbackType('bug')
        setContent('')
        setEmail('')
        setSubmitStatus('idle')
    }

    // 关闭弹窗时重置
    useEffect(() => {
        if (!open) {
            // 延迟重置，等待关闭动画完成
            const timer = setTimeout(resetForm, 200)
            return () => clearTimeout(timer)
        }
    }, [open])

    // 处理提交
    const handleSubmit = async () => {
        if (!canSubmit) return

        setIsSubmitting(true)

        try {
            // 提交反馈
            const result = await submitFeedback({
                type: feedbackType,
                content: content.trim(),
                email: email.trim(),
            })

            if (result.success) {
                setSubmitStatus('success')
                toast.success(dict.feedback?.toastSuccess || '反馈提交成功！')

                // 3秒后自动关闭
                setTimeout(() => {
                    setOpen(false)
                }, 3000)
            } else {
                setSubmitStatus('error')
                toast.error(dict.feedback?.toastError || '提交失败，请重试')
            }
        } catch (error) {
            console.error('Submit error:', error)
            setSubmitStatus('error')
            toast.error(dict.feedback?.toastError || '提交失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    // 渲染成功状态
    const renderSuccess = () => (
        <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                    {dict.feedback?.successTitle || '提交成功！'}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {dict.feedback?.successMessage || '感谢你的反馈！我们会认真查看每一条建议。'}
                </p>
                {email && (
                    <p className="text-xs text-muted-foreground">
                        {dict.feedback?.successNote || '如果你留了邮箱，我们可能会联系你了解更多细节。'}
                    </p>
                )}
            </div>
            <Button onClick={() => setOpen(false)} className="mt-4">
                {dict.feedback?.closeButton || '关闭'}
            </Button>
        </div>
    )

    // 渲染表单
    const renderForm = () => (
        <div className="space-y-4">
            {/* 反馈类型 */}
            <div className="space-y-2">
                <Label htmlFor="feedback-type">
                    {dict.feedback?.typeLabel || '反馈类型'} <span className="text-red-500">*</span>
                </Label>
                <Select value={feedbackType} onValueChange={(value) => setFeedbackType(value as FeedbackType)}>
                    <SelectTrigger id="feedback-type">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bug">
                            {dict.feedback?.types?.bug || '🐛 Bug反馈'}
                        </SelectItem>
                        <SelectItem value="feature">
                            {dict.feedback?.types?.feature || '💡 功能建议'}
                        </SelectItem>
                        <SelectItem value="other">
                            {dict.feedback?.types?.other || '💬 其他反馈'}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 详细描述 */}
            <div className="space-y-2">
                <Label htmlFor="feedback-content">
                    {dict.feedback?.contentLabel || '详细描述'} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="feedback-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={5}
                    className="resize-none"
                    maxLength={maxLength}
                />
                <div className="flex justify-between items-center text-xs">
                    <span className={contentError ? 'text-red-500' : 'text-muted-foreground'}>
                        {contentError === 'contentRequired' && (dict.feedback?.contentRequired || '请填写详细描述')}
                        {contentError === 'contentTooShort' && `至少需要 ${FEEDBACK_CONFIG.validation.contentMinLength} 个字符`}
                    </span>
                    <span className={contentLength > maxLength * 0.9 ? 'text-yellow-500' : 'text-muted-foreground'}>
                        {contentLength} / {maxLength}
                    </span>
                </div>
            </div>

            {/* 联系邮箱 */}
            <div className="space-y-2">
                <Label htmlFor="feedback-email">
                    {dict.feedback?.emailLabel || '联系邮箱'} <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.feedback?.emailPlaceholder || 'your@email.com'}
                />
                {emailError && (
                    <p className="text-xs text-red-500">
                        {dict.feedback?.emailInvalid || '邮箱格式不正确'}
                    </p>
                )}
                {!email && (
                    <p className="text-xs text-muted-foreground">
                        {dict.feedback?.emailRequired || '请填写邮箱，以便我们回复你'}
                    </p>
                )}
            </div>

            {/* 按钮 */}
            <div className="flex justify-end gap-2 pt-4">
                <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                >
                    {dict.feedback?.cancelButton || '取消'}
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {dict.feedback?.submittingButton || '提交中...'}
                        </>
                    ) : (
                        dict.feedback?.submitButton || '提交反馈'
                    )}
                </Button>
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={triggerIconOnly ? 'icon' : 'sm'}
                    className={cn('text-sm', triggerClassName)}
                    onClick={onTriggerClick}
                    aria-label={dict.feedback?.triggerButton || '反馈'}
                >
                    <MessageSquare className={cn('h-4 w-4', !triggerIconOnly && 'mr-1')} />
                    {triggerIconOnly ? (
                        <span className="sr-only">{dict.feedback?.triggerButton || '反馈'}</span>
                    ) : (
                        dict.feedback?.triggerButton || '反馈'
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {dict.feedback?.title || '反馈与建议'}
                    </DialogTitle>
                </DialogHeader>
                {submitStatus === 'success' ? renderSuccess() : renderForm()}
            </DialogContent>
        </Dialog>
    )
}
