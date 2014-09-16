from django.contrib import admin
from jeffreyvwong.models import Language, Snippet

class LanguageAdmin(admin.ModelAdmin):
    list_display = ['__unicode__']
    ordering = ['name']
    prepopulated_fields = {'slug': ['name']}

class SnippetAdmin(admin.ModelAdmin):
    list_display = ['__unicode__']
    ordering = ['-pub_date']

admin.site.register(Snippet, SnippetAdmin)
admin.site.register(Language, LanguageAdmin)



from jeffreyvwong.models import JsonData

class JsonDataAdmin(admin.ModelAdmin):
    list_display = ['__unicode__']
    ordering = ['-pub_date']

admin.site.register(JsonData, JsonDataAdmin)
