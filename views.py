from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader, Context
from django.shortcuts import render_to_response

from django.views.generic.base import TemplateView, View
from jeffreyvwong.models import JsonData, Questionnaire
from jeffreyvwong.forms import QuestionnaireForm

import logging
import json
#~ logging.basicConfig(filename='weblog.log', level=logging.DEBUG)
#logging.basicConfig(level=logging.INFO)

class HomeView(TemplateView):
    template_name = "jeffreyvwong/home.html"

class BlogosphereView(View):
    def get(self, request, *args, **kwargs):
        blogs = JsonData.objects.all()[0]
        #logging.error(blogs.json)
        return HttpResponse(json.dumps(blogs.json), content_type = "application/json")    
    
from django.views.generic.edit import FormView

class QuestionnaireView(FormView):
    template_name = 'jeffreyvwong/question_form.html'
    form_class = QuestionnaireForm
    success_url = '../question_success'
    
    def form_valid(self, form):
        new_object = form.save()
        new_object.save()
        return super(QuestionnaireView, self).form_valid(form)



from django.views.generic import TemplateView

class QuestionnaireSuccessView(TemplateView):
    template_name = 'jeffreyvwong/question_success.html'    
    
    def get_context_data(self, **kwargs):
        context = super(QuestionnaireSuccessView, self).get_context_data(**kwargs)
        context['latest_object'] = Questionnaire.objects.all()[:1]
        #logging.error(context)
        return context


class RobotsView(TemplateView):
    def get(self, request, *args, **kwargs):
        t = loader.get_template('jeffreyvwong/seo/robots.txt')
        c = Context({})
        contents = t.render(c)
        response = HttpResponse(contents, content_type="text/plain")
        return response

    
   


