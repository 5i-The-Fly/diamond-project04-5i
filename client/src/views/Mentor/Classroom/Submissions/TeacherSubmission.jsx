// This is NO LONGER acrude copy of ActivityLevelReport.jsx from the researcher view. I KIND OF know what I'm doing 
// - Brody

import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, message } from 'antd';
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


    const handleScoreChange = (e, key, dataIndex) => {
      const newScore = parseInt(e.target.value, 10); // TODO: This is a bit sketchy, but it works for testing for now.
      const newStudents = [...students];
      const studentIndex = newStudents.findIndex((student) => student.key === key);
      newStudents[studentIndex].grades[dataIndex] = newScore;
      setStudents(newStudents);
    };


    // This is the input cell that handles changing the grade.
    // This will likely need refining, but it is built for quick testing.
    {/*
    const EditableCell = ({
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    }) => {
    
      return (
        <td {...restProps}>
          {editing ? (
            <Form.Item
              style = {{ margin: 0 }}
              initialValue = {children[1]?.props?.children || '-'} 
            >
              
              
            </Form.Item>
          ) : (
            children
          )}
        </td>
      );
    };
  */}
    



    // This snippet determines the score for each assignment for every student.
    // It currently sets it equal to 90.
    // TODO: Since we have to actually get and save scores, we should probably change this to some actual database thing.
    // I don't know how to do that, so this works for now :D
    const defaultScore = 90;
    const studentScores = students.map((student, index) => ({
      key: index, // TODO: figure out a better way to index students, use a student id if it exists.
      studentName: student.name,
      // this bit sets scores to be key value pairs, mapping an activity to an integer
      scores: activities.reduce((acc, activity) => {
        acc[activity.number] = defaultScore;
        return acc;
      }, {}),
    }));

    // So studentScores is a list of [int, string, scores] objects, and scores
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
        dataIndex: ['scores', activity.number.toString()], // sets the cell value equal to the score from studentScores
        // Cyrus: New score color scheme
        render: (score, record) => {
          let color;
          if (score >= 95) {
            color = '#008000'; // Dark Green
          } else if (score >= 90 && score < 95) {
            color = '#32CD32'; // Lime Green
          } else if (score >= 80 && score < 90) {
            color = '#90EE90'; // Light Green
          } else if (score >= 70 && score < 80) {
            color = '#FFBF00'; // Amber
          } else if (score >= 60 && score < 70) {
            color = '#FFA500'; // Orange
          } else {
            color = 'red'; // Red for all other scores
          }
          return (
            <Input
              defaultValue={score === 90 ? '-' : score} // Need to replace 90 with default grade logic
              // onPressEnter={(e) => saveScore(record.key, activity.number)} // need to define saveScore
              onChange={(e) => handleScoreChange(record.key, activity.number, e.target.value)}
            />
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
          title={'NotGRades'}
        />
        <div id="table-container">
          <Table
          columns = {columns}
          dataSource = {studentScores}
          pagination = {false} // idk what this does, breaks up table if too big?
          />
        </div>
      </div>
    );
}