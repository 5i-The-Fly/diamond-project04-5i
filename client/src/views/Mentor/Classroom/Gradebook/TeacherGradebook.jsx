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
import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Input, message } from 'antd';
import MentorSubHeader from '../../../../components/MentorSubHeader/MentorSubHeader';
import CellButton from './CellButton.jsx'
import './TeacherGradebook.less'

import {
  getLessonModule,
  getLessonModuleActivities,
  getClassroom,
  getScoredRubrics,
} from '../../../../../src/Utils/requests';


export default function TeacherGradebook( { classroomId } ) {
  // These are the state variables we need access to. Each are arrays, so [] is put inside useState().
  const [activities, setActivities] = useState([]); 
  const [students, setStudents] = useState([]);
  const [scoredRubrics, setScoredRubrics] = useState([]);
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


  const fetchRubrics = async () => {
    const scoredRubricsResponse = await getScoredRubrics();
    
    if (scoredRubricsResponse.err) {
      message.error("Error fetching scored rubrics");
      return { scoredRubrics: [] };
    }

  
    return {
      scoredRubrics: scoredRubricsResponse.data || []
    };
  };

  

  const calculateScoresForStudent = (student, activities, scoredRubrics) => {
    let scores = {};

    // console.log("Here are all of the scored Rubrics:", scoredRubrics);

    // console.log("Here are all of the activities:", activities);

    // console.log("Here is the current student:", student);
  
    activities.forEach(activity => {
      // Find all scoredRubrics for the current student and activity
      const rubricsForActivity = scoredRubrics.filter(r => r.student.id === student.id && r.activity.id === activity.id);
      
      // Find the rubric with the highest total score
      const bestRubric = rubricsForActivity.reduce((max, rubric) => (rubric.totalScore > max.totalScore ? rubric : max), { totalScore: -1 }); 

      //console.log("The best rubric for student", student.name, "and activity", activity.id, "is", bestRubric);
      //console.log("The best rubric's total score is", bestRubric.totalScore);
      //console.log("The activity's max score is", activity.maxScore);
  
      // Calculate the score as a percentage of the activity's maximum score
      let score = bestRubric && bestRubric.totalScore !== -1 ? (bestRubric.totalScore / activity.maxScore) * 100 : 0;

      // Apply conditional rounding
      if (score < 10) {
        // For one-digit percentages, round to two decimal places
        scores[activity.id] = parseFloat(score.toFixed(2));
      } else if (score >= 100) {
        // For perfect scores, round to zero decimal places
        scores[activity.id] = parseFloat(score.toFixed(0));
      } else {
        // For two-digit percentages, round to one decimal place
        scores[activity.id] = parseFloat(score.toFixed(1));
      }
    });
  
    return scores;
  };



  const updateTableData = (activities, students, scoredRubrics) => {
    const updatedStudents = students.map(student => ({
      ...student,
      scores: calculateScoresForStudent(student, activities, scoredRubrics.scoredRubrics)
    }));

    //console.log("Updated students:", updatedStudents);

    const newColumns = [
      { title: 'Student', dataIndex: 'name', key: 'name' },
      ...activities.map(activity => ({
        key: activity.id,
        title: `Activity ${activity.number}`,
        render: (_, student) => (
          <CellButton 
            student={student}
            activity={activity}
            score={student.scores[activity.id]}
          />
        )
      }))
    ];

    setColumns(newColumns);
    setTableData(updatedStudents);
  };



  
  const fetchData = async () => {
    try {
      const classroom = await fetchClassroomData(classroomId);
      if (!classroom) return;

      const activitiesWithMaxScores = await fetchActivitiesWithMaxScores(classroom);
      setActivities(activitiesWithMaxScores);

      const scoredRubricsData = await fetchRubrics();
      setScoredRubrics(scoredRubricsData.scoredRubrics);

      updateTableData(activitiesWithMaxScores, classroom.students, scoredRubricsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Error fetching classroom data");
    }
  };
  


  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Set up polling every 3 seconds
    // Not the most resource efficient, but it is easier to implement than a websocket
    const intervalId = setInterval(fetchData, 3000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [classroomId]);
  
  



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