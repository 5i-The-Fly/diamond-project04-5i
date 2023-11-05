// This is NO LONGER acrude copy of ActivityLevelReport.jsx from the researcher view. I KIND OF know what I'm doing 
// - Brody

import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import MentorSubHeader from '../../../../components/MentorSubHeader/MentorSubHeader';
import './TeacherGradebook.less'

import {
  getLessonModule,
  getLessonModuleActivities,
  getClassroom,
} from '../../../../../src/Utils/requests'; // TODO: so many ../ 



// creating a new component modeled after Roster.jsx
export default function TeacherGradebook( { classroomId } ) {
  // these are the state variables we need access to
  const [classroom, setClassroom] = useState({});
  const [activities, setActivities] = useState([]); // this is an array, so we do the [] thing
  const [students, setStudents] = useState([]);
  const [activeLessonModule, setActiveLessonModule] = useState(null); // TODO: not sure if this is needed beyond getting activities, could be const?


  // useEffect will get us all our necessary state variables methinks
  useEffect(() => {
    // get the classroom from our input id
    getClassroom(classroomId).then((res) => {
      if (res.data) {
        const classroom = res.data;
        setClassroom(classroom);
        // students is grabbed too
        setStudents(classroom.students);
        // get list of assignments (taken from Home.jsx's approach)
        classroom.selections.forEach(async (selection) => {
          if (selection.current) {
            const lsRes = await getLessonModule(
              selection.lesson_module
            );
            if (lsRes.data) setActiveLessonModule(lsRes.data);
            else {
              message.error(lsRes.err);
            }
            const activityRes = await getLessonModuleActivities(lsRes.data.id);
            if (activityRes) setActivities(activityRes.data);
            else {
              message.error(activityRes.err);
            }
          }
        });
      } else {
        message.error(res.err);
      }
    });
    }, [classroomId]);


    // This snippet determines the grade for each assignment for every student.
    // It currently sets it equal to 90.
    // TODO: Since we have to actually get and save grades, we should probably change this to some actual database thing.
    // I don't know how to do that, so this works for now :D
    const defaultGrade = 90;
    const studentGrades = students.map((student, index) => ({
      key: index, // TODO: figure out a better way to index students, use a student id if it exists.
      studentName: student.name,
      // this bit sets grades to be key value pairs, mapping an activity to an integer
      grades: activities.reduce((acc, activity) => {
        acc[activity.number] = defaultGrade;
        return acc;
      }, {}),
    }));

    // So studentGrades is a list of [int, string, grades] objects, and grades
    // is another list of [activity, int] pairs

    
    // Construct the columns for the table!
    const columns = [
      {
        // first column for the student name
        title: 'Student',
        dataIndex: 'studentName',
        key: 'studentName'
      },
      // subsequent columns for each activity
      ...activities.map((activity) => ({ // .map() constructs an array, ... unpacks it.
        key: activity.number,
        title: 'Level ' + activity.number,
        dataIndex: ['grades', activity.number.toString()], // sets the cell value equal to the grade from studentGrades
        // Cyrus: New grade color scheme
        render: (grade) => {
          let color;
          if (grade >= 95) {
            color = '#008000'; // Dark Green
          } else if (grade >= 90 && grade < 95) {
            color = '#32CD32'; // Lime Green
          } else if (grade >= 80 && grade < 90) {
            color = '#90EE90'; // Light Green
          } else if (grade >= 70 && grade < 80) {
            color = '#FFBF00'; // Amber
          } else if (grade >= 60 && grade < 70) {
            color = '#FFA500'; // Orange
          } else {
            color = 'red'; // Red for all other grades
          }
          return (
            <Tag color={color}>{grade}</Tag>
          );
        },
      })),
    ];


    // for the back button!
    const handleBack = () => {
      navigate('/dashboard');
    };


    return (
      <div>
        <button id='home-back-btn' onClick={handleBack}>
          <i className='fa fa-arrow-left' aria-hidden='true' />
        </button>
        <MentorSubHeader
          title={'Gradebook'}
        />
        <div id="table-container">
          <Table
          columns = {columns}
          dataSource = {studentGrades}
          pagination = {false} // idk what this does, breaks up table if too big?
          />
        </div>
      </div>
    );
}