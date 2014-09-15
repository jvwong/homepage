import datetime

from json_field import JSONField
from django.db import models
from pygments import lexers, formatters, highlight
from django.contrib.auth.models import User
from markdown import markdown
from tagging.fields import TagField
import datetime

class Language(models.Model):
    name = models.CharField(max_length = 100)
    slug = models.SlugField(unique = True)
    language_code = models.CharField(max_length = 50)
    mime_type = models.CharField(max_length = 100)

    class Meta:
        ordering = ['name']
        
    def __unicode__(self):
        return self.name
    
    @models.permalink 
    def get_absolute_url(self):
        return ('jeffreyvwong_language_detail', (), {'slug': self.slug})
    
    def get_lexer(self):
        return lexers.get_lexer_by_name(self.language_code)
    
    
    
class Snippet(models.Model):
    title = models.CharField(max_length = 255, blank = False)
    language = models.ForeignKey(Language)
    author = models.ForeignKey(User)
    description = models.TextField( blank = False )
    description_html = models.TextField(editable = False)
    code = models.TextField( blank = True )
    highlighted_code = models.TextField(editable = False)
    tags = TagField()
    snippet_tease = models.ImageField(upload_to='snippet', null=True, blank=True)
    pub_date = models.DateTimeField(editable = True)
    updated_date = models.DateTimeField(editable = False)
    
    class Meta:
        ordering = ['-pub_date']
        
    def __unicode__(self):
        return self.title
    
    
    def highlight(self):
        return highlight(self.code,
                         self.language.get_lexer(),
                         formatters.HtmlFormatter(lineos = True)
                         )
    
    def save(self, force_insert = False, force_update = False):
        if not self.id:
            self.pub_date = datetime.datetime.now()
        self.updated_date = datetime.datetime.now()
        self.description_html = markdown(self.description)
        self.highlighted_code = self.highlight()
        super(Snippet, self).save(force_insert, force_update)
        
    @models.permalink 
    def get_absolute_url(self):
        return ('jeffreyvwong_visualization_detail', (), {'pk': self.id})
        
    

class JsonData(models.Model):
    #Core fields
    title = models.CharField(max_length=250) 
    json = JSONField(blank = False)
    
    #Auto populated 
    pub_date = models.DateTimeField(auto_now_add = True)
     
    class Meta:
        verbose_name_plural = "JsonData"
    
    def __unicode__(self):
        return self.title   



class Questionnaire(models.Model):
    name = models.CharField(max_length = 30)
    email = models.CharField(max_length = 30)   
    location = models.CharField(max_length = 30, blank = True)
    background = models.CharField(max_length = 30, blank = True)
    aptitude = models.CharField(max_length = 30, blank = True)
    
    interest = models.CharField(max_length = 30, blank = True)
    commitment = models.CharField(max_length = 30, blank = True)
    
    previous = models.TextField(blank = False)
    obstacles = models.TextField(blank = False)        
    goals = models.TextField(blank = True)
    include = models.TextField(blank = True)
    avoid = models.TextField(blank = True)
    
    comments = models.TextField(blank = True)   
    
    pub_date = models.DateTimeField(auto_now_add = True)
    
    class Meta:
        ordering = ['-pub_date']
        verbose_name_plural = "Questionnaires"
    
    def __unicode__(self):
        return self.name  
