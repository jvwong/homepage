from django.conf.urls import *
from django.views.generic.base import TemplateView
from jeffreyvwong.views import QuestionnaireView, QuestionnaireSuccessView
from jeffreyvwong.models import Questionnaire
 
urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(template_name = 'jeffreyvwong/learning.html'), name='jeffreyvwong_learning'),
    url(r'^questionnaire/$', QuestionnaireView.as_view(), name='jeffreyvwong_questionnaire'),
    url(r'^question_success/$', QuestionnaireSuccessView.as_view(), name='jeffreyvwong_questionnaire_success'),
    url(r'^course/$', TemplateView.as_view(template_name = 'jeffreyvwong/course.html'), name='jeffreyvwong_course'),
)


