from django.conf.urls import *
from jeffreyvwong.models import Snippet 
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.generic.base import TemplateView, View
from jeffreyvwong.views.base import BlogosphereView
import logging

urlpatterns = patterns('',
    url(r'^$',
        ListView.as_view(template_name="jeffreyvwong/visualization_list.html",
                         queryset = Snippet.objects.all(),
                         allow_empty = True,
                         paginate_by = 20),
        name='jeffreyvwong_visualization'
        ),
    
    url(r'^(?P<pk>\d+)/$',
        DetailView.as_view( template_name="jeffreyvwong/visualization_detail.html",
                            queryset = Snippet.objects.all()),
                            name='jeffreyvwong_visualization_detail'),

    url(r'^household/$', TemplateView.as_view(template_name='jeffreyvwong/visual/household.html'),
                                                    name='jeffreyvwong_household'),

    url(r'^buyrent/$', TemplateView.as_view(template_name='jeffreyvwong/visual/buyrent.html'),
                                                    name='jeffreyvwong_buyrent'),

    url(r'^cellular/$', TemplateView.as_view(template_name='jeffreyvwong/visual/cellular.html'),
                                                    name='jeffreyvwong_cellular'),

    url(r'^flow/$', TemplateView.as_view(template_name='jeffreyvwong/visual/flowFilter.html'),
                                                    name='jeffreyvwong_flow'),

    url(r'^gvt/$', TemplateView.as_view(template_name='jeffreyvwong/visual/gvt.html'),
                                                    name='jeffreyvwong_gvt'),
)

