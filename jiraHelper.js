var jiraHelper = {
  taskBranch: false,

  requestTo: function(resource, data, request) {
    if (!this.taskBranch) {
      return false;
    }

    if(jiraHelper.username.length < 1) {
      jiraHelper.getUserPass();
    }

    var postData = JSON.stringify(data);
    var postHeaders = {
      "Authorization" : "Basic " + Utilities.base64Encode(jiraHelper.username + ':' + jiraHelper.password),
      "Content-Type":"application/json"
    }

    var params = {
      "method": request,
      "headers": postHeaders,
      "payload": postData,
    };

    var url = dataHelper.jiraUrls[this.taskBranch] + "/rest/api/latest/" + resource;
    var httpResponse = UrlFetchApp.fetch(url, params);
    return httpResponse.getResponseCode();
  },
​
  searchIssueByKey: function(issueKey) {
    var jqlData = {
      "jql": 'issueKey = ' + issueKey,
    };

    var response = jiraHelper.requestTo('search', jqlData, 'post');
    return response.issues[0].fields;
  },

  addWorklog: function(issueKey, date, timeSpent) {
    var data = {
      'started': date,
      'comment': "timelog by autologger by Aaron and Detre",
      'timeSpentSeconds': timeSpent
    };
    var responseCode = jiraHelper.requestTo('issue/' + issueKey + '/worklog', data, 'post');
    if ( responseCode == 201 ) {
      return true;
    }
    else {
      return responseCode;
    }
  },

  getIssueByKey: function(issueKey) {
    if (!this.processTaskBranch(issueKey)) {
      return 'ERROR';
    }

    var url = dataHelper.jiraUrls[this.taskBranch] + "/rest/api/2/issue/" + issueKey;
    var postHeaders = {
      "Authorization" : "Basic " + Utilities.base64Encode(dataHelper.jiraUser + ':' + dataHelper.jiraPass),
      "Content-Type":"application/json"
    };
    var response = UrlFetchApp.fetch(url, {method:"GET",headers:postHeaders});
    return JSON.parse(response);
  },

  processTaskBranch: function(issueKey) {
    this.taskBranch = 'packt';

    // if (issueKey.toLowerCase().indexOf('packt') < 0) {
    //    this.taskBranch = 'bluetel';
    // }

    return this.taskBranch;
  },
};
