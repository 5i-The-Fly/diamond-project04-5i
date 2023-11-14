// Gradebook view for teachers.
// ---------------------------------------------------------------------------------------------------------
// Primary component is a table where each cell represents a collection of submissions, with one of them being the 'active' submission.
// For now, this will be the first submission in the array.

// An individual submission has a scored rubric which contains the final score.
// In the frontend, students are rows and activites are columns.

// Cells are buttons with a display score.
// Display score is taken from the active submission (first in submission array for now)
// Button sends to the submission tab. Later, it can set the 'current' paramater of the submission tab.

// ---------------------------------------------------------------------------------------------------------
// TODO:
// [x] Get submission from student + activity
//    [x] Get all submissions for the classroom (classroom->submissions->sessions)
//    [x] Build map
//        - Key: Student, activity
//        - Value: Submission[]
// [ ] Display score
//    [ ] Default value ()
//    [ ] If submission doesn't exist, display '-'
// [ ] Button component
//    [ ] Color based on display score
//    [ ] Send to submission tab
//    [ ] Send to specific submissions
// [ ] Totals/average row/column
// ---------------------------------------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, message } from 'antd';
import MentorSubHeader from '../../../../components/MentorSubHeader/MentorSubHeader';
import './TeacherGradebook.less'

import {
  getLessonModule,
  getLessonModuleActivities,
  getClassroom,
} from '../../../../../src/Utils/requests';


export default function TeacherGradebook( { classroomId } ) {
  // These are the state variables we need access to. Each are arrays, so [] is put inside useState().
  const [activities, setActivities] = useState([]); 
  const [students, setStudents] = useState([]);
  const [submissionsMap, setSubmissionsMap] = useState([]); // Maps a student and activity pair to an array of submissions. One submission can appear multiple times.

  // Not sure if these are needed, but they were states in the component this was copied from (Home.jsx)
  //const [classroom, setClassroom] = useState({});
  //const [activeLessonModule, setActiveLessonModule] = useState(null);

  

  // useEffect will get us all our necessary state variables methinks.
  // TODO: Is this called every time data is updated? Worried about speed if we're remaking the table every time.
  useEffect(() => {
    // =Get the classroom from our input id
    getClassroom(classroomId).then((res) => {
      if (!res.data) {
        message.error(res.err);
        return
      }
        // These are not needed beyond getting our other states, so they can be constant inside useEffect.
        const classroom = res.data;
        const sessions = classroom.sessions
        //setClassroom(classroom);

        // Get Students
        setStudents(classroom.students);

        
        // Get Activities (taken from Home.jsx's approach)
        classroom.selections.forEach(async (selection) => {
          if (selection.current) {
            const lsRes = await getLessonModule(selection.lesson_module);
            if (!lsRes.data) message.error(lsRes.err); 
            const activityRes = await getLessonModuleActivities(lsRes.data.id);
            if (activityRes) setActivities(activityRes.data);
            else {
              message.error(activityRes.err);
            }
          }
        });

        // Create submissions map, assigning each student/activity pair to an array of submissions
        let tempSubmissionsMap 
        students.forEach(async (student) => {
          activities.forEach(async (activity) => {
            tempSubmissionsMap.set([student, activity], []) // initialize to empty
          });
        });

        // Loop through every session, loop through every submission in the session. Loop through every student in submission!
        // Push submission on to map.
        classroom.sessions.forEach(async (session) => {
          session.submissions.forEach(async (submission) => {
            session.students.forEach(async (student) => {
              tempSubmissionsMap.get([student, submission.activity]).push(submission)

            });
          });
        });
        // Finally!
        setSubmissionsMap(tempSubmissionsMap)

    });
    }, [classroomId]);


    // Cyrus: Need to update handleScoreChange to actually save score to database when updated.
    const handleScoreChange = (e, studentIndex, activityNumber) => {
      const newScore = parseInt(e.target.value, 10);
      const studentName = students[studentIndex].name;

      // Log the information to ensure input box corresponds to correct student and activity
      console.log('Score: ' + newScore + ', Student: ' + studentName + ', Activity: ' + activityNumber);
      
      const newStudents = [...students];
      // const studentIndex = newStudents.findIndex((student) => student.key === key);
      newStudents[studentIndex].grades[activityNumber] = newScore;
      setStudents(newStudents);

      // TODO: Cyrus: updates to backend needed here
    };


    // Cyrus: This is the input cell that handles changing the grade.
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
          // Cyrus: input cell for changing the score
          return (
            <Input
              defaultValue={score === 90 ? '-' : score} // Need to replace 90 with default grade logic
              // onPressEnter={(e) => saveScore(record.key, activity.number)} // need to define saveScore
              onBlur={(e) => handleScoreChange(e, record.key, activity.number)} // handle on blur
              onPressEnter={(e) => handleScoreChange(e, record.key, activity.number)} // handle on press enter
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
          title={'Gradebook'}
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