from django.conf.urls import patterns, url, include
from django.contrib import admin
admin.autodiscover()
from django.views.generic.base import TemplateView
from jeffreyvwong.sitemaps import SnippetSitemap, PageSitemap
from jeffreyvwong.views.base import RobotsView

sitemaps = {
    'snippets': SnippetSitemap(),
    'pages': PageSitemap([ 'jeffreyvwong_home'
                        ,  'jeffreyvwong_bio'
                        ,  'jeffreyvwong_skills'
                        ,  'jeffreyvwong_cv'
                        ,  'jeffreyvwong_contact'
                        ,  'jeffreyvwong_modelling'
                        ,  'jeffreyvwong_publication'
                        ])
}

urlpatterns = patterns('',

    url(r'^$', TemplateView.as_view(template_name='jeffreyvwong/home.html'), name='jeffreyvwong_home'),

    url(r'^bio/$',     TemplateView.as_view(template_name='jeffreyvwong/background.html'), name='jeffreyvwong_background'),
    url(r'^cv/$',      TemplateView.as_view(template_name='jeffreyvwong/cv.html'), name='jeffreyvwong_cv'),
    url(r'^contact/$', TemplateView.as_view(template_name='jeffreyvwong/contact.html'), name='jeffreyvwong_contact'),
    url(r'^admin/', include(admin.site.urls)),

    url(r'^consulting/', include('jeffreyvwong.urls.consulting')),
    url(r'^background/$', TemplateView.as_view(template_name='jeffreyvwong/background.html'), name='jeffreyvwong_background'),

    url(r'^sitemap\.xml$', 'django.contrib.sitemaps.views.sitemap', {'sitemaps': sitemaps}),
    url(r'^robots\.txt$', RobotsView.as_view(), name='robots')
)



