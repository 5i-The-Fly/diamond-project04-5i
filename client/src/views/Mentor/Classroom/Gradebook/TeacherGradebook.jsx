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
  getSubmissions,
  getScoredRubrics,
  getSessions,
} from '../../../../../src/Utils/requests';


export default function TeacherGradebook( { classroomId } ) {
  // These are the state variables we need access to. Each are arrays, so [] is put inside useState().
  const [activities, setActivities] = useState([]); 
  const [students, setStudents] = useState([]);
  const [classSubmissions, setClassSubmissions] = useState([]); // Maps a student and activity pair to an array of submissions. One submission can appear multiple times.
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);

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



  const fetchClassroomData = async (classroomId) => {
    const response = await getClassroom(classroomId);
    if (!response.data) {
      message.error(response.err);
      return null;
    }
    return response.data;
  };

  // Fetches all activities for the current lesson module and adds the max score to each activity
  const fetchActivitiesWithMaxScores = async (classroom) => {
    const activities = await Promise.all(classroom.selections.map(async (selection) => { 
      if (selection.current) {
        const lsRes = await getLessonModule(selection.lesson_module);
        if (lsRes.data) {
          const activityRes = await getLessonModuleActivities(lsRes.data.id);
          if (activityRes.data) {
            return Promise.all(activityRes.data.map(async (activity) => { 
              const rubric = activity.rubric;
              if (!rubric) {
                console.log("No rubric for activity:", activity.id);
                return activity;
              }
              else {
                const maxScore = rubric.max_score;
                return { ...activity, maxScore };
              }
            }));
          }
        }
      }
      return [];
    }));

    // console.log("Activities:", activities);
    return activities.flat();
  };


  const fetchSubmissionsAndRubrics = async () => {
    const submissionsResponse = await getSubmissions();
    const scoredRubricsResponse = await getScoredRubrics();
    
    if (submissionsResponse.err || scoredRubricsResponse.err) {
      message.error("Error fetching submissions or scored rubrics");
      return { submissions: [], scoredRubrics: [] };
    }
  
    return {
      submissions: submissionsResponse.data || [],
      scoredRubrics: scoredRubricsResponse.data || []
    };
  };

  
  const fetchAllSessions = async () => {
    const response = await getSessions();
    if (response.err) {
      message.error("Error fetching sessions");
      return [];
    }
    // console.log("Sessions Response:", response);
    return response.data || [];
  };
  
 
  const processStudents = (classroom, allSessions, submissions, scoredRubrics) => {
    // Log the scoredRubrics data to verify its structure
    // console.log("Scored Rubrics Data:", scoredRubrics);
  
    return classroom.students.map((student) => {
      const studentSessions = allSessions.filter(session => 
        session.students.some(s => s.id === student.id)
      );
  
      studentSessions.forEach(session => {
        // console.log("Session:", session, "Student:", student.name);
      });
  
      return {
        ...student,
        sessions: studentSessions.map((session) => {
          const sessionSubmissions = submissions.filter(submission => 
            submission.session && submission.session.id === session.id
          );

          sessionSubmissions.forEach(submission => {
            // console.log(`Processing Submission ID: ${submission.id}`);
            const scoredRubric = scoredRubrics.find(rubric => {
              // console.log(`Checking Rubric:`, rubric, `Submission ID Type: ${typeof submission.id}`, `Rubric Submission ID Type: ${typeof rubric.submission}`);
              return rubric.submission.id === submission.id;
            }) || {};
            // console.log(`Found Scored Rubric for Submission ID ${submission.id}:`, scoredRubric);
          });
          
  
          // console.log("Session Submissions Before:", sessionSubmissions);
  
          const updatedSubmissions = sessionSubmissions.map((submission) => {
            const scoredRubric = scoredRubrics.find(rubric => rubric.submission.id === submission.id) || {};
            // Log each submission after attaching scored rubric
            // console.log("Submission with scored_rubric:", {...submission, scored_rubric: scoredRubric});
            return {
              ...submission,
              scored_rubric: scoredRubric
            };
          });
  
          // console.log("Session Submissions After:", updatedSubmissions);
          // console.log("Session:", session, "Student:", student.name)
  
          return {
            ...session,
            submissions: updatedSubmissions
          };
        })
      };
    });
  };
  
  


  // This function will calculate scores for each student
  const calculateScoresForStudent = (student, activities) => {
    let scores = {};
    activities.forEach(activity => {
      scores[activity.id] = calculateScore(student, activity);
    });
    return scores;
  };

  // Modify the calculateScore function to properly handle the data
  const calculateScore = (student, activity) => {
    // Ensure the sessions are defined and are an array
    if (!student.sessions || !Array.isArray(student.sessions)) {
      console.error("Invalid sessions data for student:", student);
      return 0; // Default score
    }

    // Log the student and activity being processed
    //console.log(`Calculating score for Student ID: ${student.id}, Activity ID: ${activity.id}`);

    const submissionsForActivity = student.sessions.flatMap(session => {
    // Log the submissions in the session
    //console.log(`Session ID: ${session.id}, Submissions:`, session.submissions);

    return session.submissions.filter(submission => {
      // Check if submission.activity is not null before accessing id
      if (submission.activity && submission.activity.id === activity.id) {
        return true;
      } else {
        return false;
      }
      });
    });

    // Log the filtered submissions for the activity
    //console.log(`Submissions for Activity ID ${activity.id}:`, submissionsForActivity);

    let totalScore = submissionsForActivity.reduce((acc, submission) => 
      acc + (submission.scored_rubric ? submission.scored_rubric.total_score : 0), 0
    );

    return totalScore > 0 ? (totalScore / activity.maxScore) * 100 : 91; // Default score if no submissions
  };

  
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classroom = await fetchClassroomData(classroomId);
        if (!classroom) return;;
  
        const activitiesWithMaxScores = await fetchActivitiesWithMaxScores(classroom);
        setActivities(activitiesWithMaxScores);

        // Debugging: Log activities and students
        //console.log("Activities with Max Scores:", activitiesWithMaxScores);
        //console.log("Initial Students:", classroom.students);
  
        const { submissions, scoredRubrics } = await fetchSubmissionsAndRubrics();
        const allSessions = await fetchAllSessions();
        const updatedStudents = processStudents(classroom, allSessions, submissions, scoredRubrics);

        updatedStudents.forEach(student => {
          student.scores = calculateScoresForStudent(student, activitiesWithMaxScores);
        });

        setStudents(updatedStudents); // Ensure this is after score calculation


        const newColumns = [
          {
            title: 'Student',
            dataIndex: 'name',
            key: 'name',
          },
          ...activities.map(activity => ({
            key: activity.id,
            title: `Activity ${activity.number}`,
            render: (_, student) => {
              const score = student.scores[activity.id];
              console.log("Student:", student.name, "Activity:", activity.number, "Score:", score)
              return (
                <CellButton 
                  student={student}
                  activity={activity}
                  score={score}
                />
              );
            }
          }))
        ];
    
        setColumns(newColumns);
        setTableData(updatedStudents);

      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Error fetching classroom data");
      }
    };
  
    fetchData();
  }, [classroomId]);
  

  
  



 /*
  const columns = [
    {
      title: 'Student',
      dataIndex: 'name',
      key: 'name'
    },
    ...activities.map(activity => ({
      key: activity.id,
      title: `Activity ${activity.number}`,
      render: (_, student) => {
        // Safely access the score for the current activity
        const activityScore = student.scores ? student.scores[activity.id] : null;
  
        return (
          <CellButton 
            student={student}
            activity={activity}
            score={activityScore} // Safely pass the score
          />
        );
      }
    }))
  ];
  
  
  const tableData = students.map(student => ({
    key: student.id,
    name: student.name,
    scores: student.scores // Presuming scores are already part of student data
  }));

*/

  


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