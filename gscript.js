function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu= ui.createMenu('Jira Helper')

  menu.addItem('Log Selected', 'logPacktTime').addToUi();
  //menu.addItem('Install', 'createSpreadsheetEditTrigger').addToUi();
}

function logPacktTime() {
  timeSheet.logPacktTime();
}

function taskTitle(taskNumber) {
  if (taskNumber.indexOf("-") < 0) {
    return;
  }

  taskInfo = jiraHelper.getIssueByKey(taskNumber);
  return taskInfo.fields.summary;
}

function getCustomer(taskNumber) {
  return dataHelper.getProjectName(taskNumber);
}

function getProject(taskKey) {
  return dataHelper.getProjectName(taskKey);
}

function monthName(monthnum) {
  return "-,January,February,March,April,May,June,July,August,September,October,November,December".split(',')[monthnum];
}
function dayName(daynum) {
  return "-,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(',')[daynum];
}



/*function onEdit(e){
  timeSheet.onEdit(e);
}*/
