from django.contrib import admin
from jeffreyvwong.models import Language, Snippet 

class LanguageAdmin(admin.ModelAdmin):
    ordering = ['name']
    prepopulated_fields = {'slug': ['name']}

class SnippetAdmin(admin.ModelAdmin):
    ordering = ['-pub_date']

admin.site.register(Snippet, SnippetAdmin)
admin.site.register(Language, LanguageAdmin)



from jeffreyvwong.models import JsonData, Questionnaire

class JsonDataAdmin(admin.ModelAdmin):
    ordering = ['-pub_date']

class QuestionnaireAdmin(admin.ModelAdmin):
    ordering = ['-pub_date']
  
admin.site.register(JsonData, JsonDataAdmin)
admin.site.register(Questionnaire, QuestionnaireAdmin)
