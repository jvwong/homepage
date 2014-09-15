from django.conf.urls import patterns, include, url
from django.contrib import flatpages
from django.contrib import admin
admin.autodiscover()
 
urlpatterns = patterns('',
    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    url(r'^admin/', include(admin.site.urls)),
    
    url(r'^comments/', include('django.contrib.comments.urls')),
    
    url(r'^search/$', 'search.views.search', name='search'), 
    
    # weblog 
    url(r'^categories/', include('jraywo.urls.categories')),
    url(r'^links/', include('jraywo.urls.links')),
    url(r'^tags/', include('jraywo.urls.tags')),
    url(r'^', include('jraywo.urls.entries')),
    
        
    #url(r'^tiny_mce/(?<path>.*)$', 'django.views.static.serve', {'document_root': '/static/jraywo/js/tinymce/'}),
    url(r'', include('django.contrib.flatpages.urls')),
)

