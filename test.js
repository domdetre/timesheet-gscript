var SpreadsheetApp =
{
  getActiveSpreadsheet: function()
  {
    return testSpreadSheet;
  }
}

var testSpreadSheet =
{
  getSheetByName: function(sheetName)
  {
    return testSheets[sheetName];
  },
  getActiveSheet: function()
  {
    return testTimeSheet;
  }
}

var testSheets =
{
  ScriptData:
  {
    getRange: function(row, col, rows, cols)
    {
      if (row === dataHelper.yearCell) {
        return {
          getValues: function() {
            return [['2017']];
          }
        };
      }

      if (row === dataHelper.yearCell) {
        return {
          getValues: function() {
            return [['7']];
          }
        };
      }

      if (row === dataHelper.passwordCellsNotation)
      {
        return {
          getValues: function() {
            return [['dfd', 'password']];
          }
        };
      }

      if (col === dataHelper.taskPrefixCol) {
        if (3 <= row && row < 10) {
          return {
            getValues: function() {
              return [['CDP', 'Packt (CDP)', 'packt']];
            }
          };
        } else {
          return {
            getValues: function() {
              return [['', '', '']];
            }
          };
        }
      }

      return false;
    }
  }
}

var testTimeSheet =
{
  getRange: function(row, col, rows, cols)
  {
    return false;
  }
}
