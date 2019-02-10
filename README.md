# hacklahoma-2019

For Hacklahoma 2019, we ended up building two apps. 

The first, [Biasly](http://biasly.org/), is a chrome extension that automatically tags
twitter posts as politically biased and determines whether they are left or right leaning.
We used Google Cloud's AutoML Natural Language service to predict whether the tweet
was partisan, and if so, how it leaned. We used data available on 
[Kaggle](https://www.kaggle.com/crowdflower/political-social-media-posts) to detect
if the post was partisan, and tweets from 20 senators, 10 from each major party, along with
a few individual accounts, to detect which way the tweet was biased. The main repository for
the extension is [here](https://github.com/Kthulu120/chrome-extension-webpack-boilerplate).

The second, [APYou](apyou.net), is an SMS service that allows a user to make API requests to a large number
of services using Twilio and a ton of free APIs.
