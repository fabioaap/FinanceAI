import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Language, getLanguageName } from '@/lib/i18n'
import { Globe, Funnel } from '@phosphor-icons/react'
import { Separator } from '@/components/ui/separator'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  language: Language
  onLanguageChange: (language: Language) => void
  onOpenCategoryMapping?: () => void
  translations: any
}

export function SettingsModal({
  open,
  onClose,
  language,
  onLanguageChange,
  onOpenCategoryMapping,
  translations,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={24} weight="bold" />
            {translations.settings.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="language" className="text-base font-semibold">
                {translations.settings.language}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {translations.settings.languageDescription}
              </p>
            </div>
            <Select value={language} onValueChange={(value) => onLanguageChange(value as Language)}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{getLanguageName('en')}</SelectItem>
                <SelectItem value="pt-BR">{getLanguageName('pt-BR')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {onOpenCategoryMapping && (
            <>
              <Separator />
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold">
                    {language === 'pt-BR' ? 'Mapeamento de Categorias' : 'Category Mapping'}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'pt-BR'
                      ? 'Personalize como as transações são categorizadas automaticamente'
                      : 'Customize how transactions are automatically categorized'
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={onOpenCategoryMapping}
                >
                  <Funnel size={18} weight="bold" />
                  {language === 'pt-BR' ? 'Configurar Regras' : 'Configure Rules'}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            {translations.modals.cancel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
