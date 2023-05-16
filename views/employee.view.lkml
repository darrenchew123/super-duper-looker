# The name of this view in Looker is "Employee"
view: employee {
  # The sql_table_name parameter indicates the underlying database table
  # to be used for all fields in this view.
  sql_table_name: `employee_datasets.employee`
    ;;
  # No primary key is defined for this view. In order to join this view in an Explore,
  # define primary_key: yes on a dimension that has no repeated values.

  # Here's what a typical dimension looks like in LookML.
  # A dimension is a groupable field that can be used to filter query results.
  # This dimension will be called "Employee Status" in Explore.

  dimension: employee_status {
    type: string
    sql: ${TABLE}.employee_status ;;
  }

  dimension: job_level {
    type: string
    sql: ${TABLE}.job_level ;;
  }

  measure: count {
    type: count
    drill_fields: []
  }
}
