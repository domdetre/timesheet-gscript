var jiraHelper = {
  taskBranch: false,

  getPostHeaders: function()
  {
    return {
      "Authorization" : "Basic " + Utilities.base64Encode(dataHelper.jiraUser + ':' + dataHelper.jiraUser),
      "Content-Type":"application/json"
    };
  }

  addWorklog: function(url, taskNumber, dateTime, secondsSpent, comments) {
    url += '/rest/api/2/issue/' + taskNumber + '/worklog'
    var data = {
      'started': dateTime,
      'comment': comments + '\n\n Timesheet Logger by dfd',
      'timeSpentSeconds': secondsSpent
    };

    var response = UrlFetchApp.fetch(url, {
      method: "POST",
      headers: jiraHelper.getPostHeaders(),
      payload: JSON.stringify(data),
    });

    if ( response.getResponseCode() === 201 ) {
      return true;
    }

    return false;
  },

  getTaskInfo: function(url, taskNumber)
  {
    url += "/rest/api/2/issue/" + taskNumber;
    var response = UrlFetchApp.fetch(url, {
      method: "GET",
      headers: jiraHelper.getPostHeaders(),
    });
    return JSON.parse(response);
  }
};
