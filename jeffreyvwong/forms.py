from django import forms
from jeffreyvwong.models import Questionnaire
import logging

textarea_small = forms.Textarea(attrs={'cols': 40, 'rows': 2})

class QuestionnaireForm(forms.Form):
    
    APTITUDE_CHOICE = (('novice', 'Novice'),
                      ('intermediate', 'Intermediate'),
                      ('expert', 'Expert'))
    
    INTEREST_CHOICE = (('low', 'Low'),
                      ('medium', 'Medium'),
                      ('high', 'High'))
    
    COMMIT_CHOICE =  (('0-2', '0 - 2 h'),
                      ('2-3', '2 - 3 h'),
                      ('3-6', '3 - 6 h'),
                      ('6-8', '6 - 8 h'))
    
    name = forms.CharField(label="Name")
    
    email = forms.EmailField(label="Email")    
    
    location = forms.CharField(required=False,
                               label="City/Postal Code")
    
    background = forms.CharField(required=False,
                                 label="Indicate your background field of study / work",
                                 widget=textarea_small)
    
    aptitude = forms.ChoiceField(label="Programming ability",
                                         widget = forms.RadioSelect(attrs={'size': 10}),
                                         choices = APTITUDE_CHOICE)
    
    interest = forms.ChoiceField(label="Choose your level of interest in taking an introductory programming course",
                                         widget = forms.RadioSelect,
                                         choices = INTEREST_CHOICE)
    
    commitment = forms. ChoiceField(label="Hours per week you could commit to a course",
                                 widget = forms.Select,
                                 choices = COMMIT_CHOICE)
    
    previous = forms.CharField(required=False,
                               label="List any previous ways or materials used to learn programming",
                               widget=textarea_small)
    
    obstacles = forms.CharField(required=False,
                                label="Describe the biggest obstacles encountered in learning to program",
                                widget=textarea_small)
        
    goals = forms.CharField(required=False,
                            label="State some of your goals with programming",
                            widget=textarea_small)
    
    include = forms.CharField(required=False,
                              label="Describe what a course should include",
                              widget=textarea_small)
    
    avoid = forms.CharField(required=False,
                            label="Indicate what a course should NOT include",
                            widget=textarea_small)
    
    comments = forms.CharField(required=False,
                               label="Additional comments or suggestions",
                               widget=textarea_small)
    
    
    def save(self):
        #logging.error(self.cleaned_data)
        new_object = Questionnaire(name = self.cleaned_data['name'],
                                   email = self.cleaned_data['email'],
                                   location = self.cleaned_data['location'],
                                   background = self.cleaned_data['background'],
                                   aptitude = self.cleaned_data['aptitude'],
                                   interest = self.cleaned_data['interest'],
                                   commitment = self.cleaned_data['commitment'],
                                   previous = self.cleaned_data['previous'],
                                   obstacles = self.cleaned_data['obstacles'],
                                   goals = self.cleaned_data['goals'],
                                   include = self.cleaned_data['include'],
                                   avoid = self.cleaned_data['avoid'],
                                   comments = self.cleaned_data['comments']
                                   )
        return new_object
        
    