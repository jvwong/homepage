from django.http import HttpResponse
from django.template import loader, Context

from django.views.generic.base import TemplateView, View
from jeffreyvwong.models import JsonData

import logging
import json

class HomeView(TemplateView):
    template_name = "jeffreyvwong/home.html"

class BlogosphereView(View):
    def get(self, request, *args, **kwargs):
        blogs = JsonData.objects.all()[0]
        #logging.error(blogs.json)
        return HttpResponse(json.dumps(blogs.json), content_type = "application/json")    
    

class RobotsView(TemplateView):
    def get(self, request, *args, **kwargs):
        t = loader.get_template('jeffreyvwong/seo/robots.txt')
        c = Context({})
        contents = t.render(c)
        response = HttpResponse(contents, content_type="text/plain")
        return response

    
   


