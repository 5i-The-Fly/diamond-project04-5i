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
// [ ] Button component
//    [ ] Color based on display score
//    [ ] Send to submission tab
//    [ ] Send to specific submissions
// [ ] Edit grades state and toggle button
//    [ ] Make state for edit mode
//    [ ] Create the toggle button
//    [ ] Make the button change the state of the input cells
// [x] Display score
//    [x] Default value for tetsts
//    [x] If submission doesn't exist, display '-'
// [ ] Get display score from the actual rubric (modify getDisplayScore function)
// [ ] Totals/average row/column
// [ ] Override score
// ---------------------------------------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, message } from 'antd';
import MentorSubHeader from '../../../../components/MentorSubHeader/MentorSubHeader';
import CellButton from './CellButton.jsx'
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
  const [classSubmissions, setClassSubmissions] = useState([]); // Maps a student and activity pair to an array of submissions. One submission can appear multiple times.

  // useEffect will get us all our necessary state variables methinks.
  // TODO: Is this called every time data is updated? Worried about speed if we're remaking the table every time.

  useEffect(() => {
    // Get the classroom from our input id
    getClassroom(classroomId).then((res) => {
      if (!res.data) {
        message.error(res.err);
        return
      }
        // This is not needed beyond getting our other states, so it can be constant inside useEffect.
      const classroom = res.data;
      // Get Students
      setStudents(classroom.students);

      // Get Activities (taken from Home.jsx's approach)
      classroom.selections.forEach(async (selection) => {
        if (selection.current) {
          const lsRes = await getLessonModule(selection.lesson_module);
          if (lsRes.data) {
            const activityRes = await getLessonModuleActivities(lsRes.data.id);
            if (activityRes) setActivities(activityRes.data);
          }
          else { message.error(lsRes.err);}
        }
      });

        // Create submissions map, assigning each student/activity pair to an array of submissions
        let tempClassSubmissions = new Map();
        students.forEach((student) => {
          activities.forEach((activity) => {
            tempClassSubmissions.set([student, activity], []); // initialize to empty
          });
        });

        // Loop through every session, loop through every submission in the session. Loop through every student in submission!
        // Push submission onto the map.
        classroom.sessions.forEach((session) => {
          if (!session.submissions) return;
          session.submissions.forEach((submission) => {
            session.students.forEach((student) => {
              tempClassSubmissions.get([student, submission.activity]).push(submission);
            });
          });
        });
        // Finally!
        setClassSubmissions(tempClassSubmissions)
      });
    }, [classroomId]);



    // TODO: CYRUS: Finish implementing the routes in order to properly test data pulling with the following code.
    useEffect(() => {
      const fetchClassroomData = async () => {
        const classroomResponse = await getClassroom(classroomId);
        if (!classroomResponse.data) {
          message.error(classroomResponse.err);
          return;
        }
        const classroom = classroomResponse.data;
    
        // Set Students
        setStudents(classroom.students);
    
        // Fetch and Set Activities with their Max Scores
        for (const selection of classroom.selections) {
          if (selection.current) {
            const lsRes = await getLessonModule(selection.lesson_module);
            if (lsRes.data) {
              const activityRes = await getLessonModuleActivities(lsRes.data.id);
              if (activityRes.data) {
                const activitiesWithMaxScores = await Promise.all(activityRes.data.map(async (activity) => {
                  const maxScore = await getTemplateRubricMaxScore(activity.rubric);
                  return { ...activity, maxScore };
                }));
                setActivities(activitiesWithMaxScores);
              } else {
                message.error(activityRes.err);
              }
            } else {
              message.error(lsRes.err);
            }
          }
        }
    
        // Fetch Submissions for Each Student
        for (const student of classroom.students) {
          const studentSessions = await getSessionsForStudent(student.id);
          for (const session of studentSessions) {
            const submissions = await getSubmissionsForSession(session.id);
            for (const submission of submissions) {
              const scoredRubric = await getScoredRubricForSubmission(submission.id);
              submission.scored_rubric = scoredRubric;
            }
            session.submissions = submissions;
          }
        }
    
        students.forEach((student) => {
          activities.forEach((activity) => {
            const submissions = classSubmissions.get([student, activity]);
            if (submissions && submissions.length > 0) {
              const totalScore = submissions[0].scored_rubric.total_score;
              const maxScore = activity.maxScore;
              const percentage = (totalScore / maxScore) * 100;
              console.log(`${student.name} percentage for activity ${activity.number}: ${percentage}%`);
            } else {
              console.log(`${student.name} has no submissions for activity ${activity.number}`);
            }
          });
        });
      };
    
      fetchClassroomData();
    
    }, [classroomId]);
    



  // Construct columns for table display
  const columns = [
    {
      // first column for the student name
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName'
    },
    // subsequent columns for each activity
    ...activities.map((activity) => ({ // '.map()' constructs an array, '...' unpacks it.
        key: activity.number,
        title: 'Level ' + activity.number,
        dataIndex: ['studentSubmissions', activity], // sets cell value equal to tableData[student].studentSubmissions[activity]
        // Cyrus: New score color scheme
        render: (activitySubmissions, record) => {
          return (
            <CellButton 
            student={record.student}
            activity={activity}
            submissions={activitySubmissions}
            />
          );
      },
    })),
  ];

  // Creates tableData for the display. 
  const tableData = students.map((student, index) => ({
    key: index, // TODO: figure out a better way to index students, use a student id if it exists.
    studentName: student.name,
    studentSubmissions: activities.reduce((accumulate, activity) => {
      accumulate[activity] = classSubmissions.get(student, activity);
      return accumulate;
    }, {}),
  }));


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
        dataSource = {tableData}
        pagination = {false} // idk what this does, breaks up table if too big?
        />
      </div>
    </div>
  );
}