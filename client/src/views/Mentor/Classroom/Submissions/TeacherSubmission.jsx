// Student Submission view for teachers.
//-------------------------------------------------------------------------------------------------
// Observable Functions : student comment section + student submission section:

// By selecting the a specific assignment from each student,
// 1. student comment section 
// If students left comment want to let the teacher know, their comment will be shown in the Student-comment container 

// 2. student submission section:
// their submission will shown in the Student-submission container 

// Hidden Functions: Add feedback + Show Rubric
// button 1: Add feedback
// When teacher click the button "Add feedback" on the left hand side in the submission bar
// A typable and editable dialog box pops up where the teacher can enter feedback, save it and send it to the student.

// button 2: Show Rubric
// When teacher click the button "Show Rubric" on the right hand side in the submission bar
// It might trigger the display of a rubric associated with the assignment or task.
// The rubric could include criteria for assessment, 
// grading guidelines,
// scores or feedback for each criterion.

//-------------------------------------------------------------------------------------------------
// TODO:
// [ ] show student comment and submission after selecting student and specific assignment.
// [ ] "Add feedback" Button 
//    [ ] making a typable and editable dialog box 
//        [ ] send feedback button
//        [ ] attach file icon
// [ ] "Show Rubric" Button 
//    [ ] Thinking about what criteria should be included
//    [ ] Make criteria Tabularization through categorization 
//    [ ] Looking at the rubric gives teacher an idea of the student's specific score
// 

//-------------------------------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { Table, Select, Tag, Input, message } from 'antd';
import { Link, useParams, useNavigate } from 'react-router-dom'; // From Researcher Role
import StudentCanvas from '../../../../components/ActivityPanels/BlocklyCanvasPanel/canvas/StudentCanvas';
import './TeacherSubmission.less'


import {
  getLessonModule,
  getLessonModuleActivities,
  getClassroom,
  getSession,
  getStudent,
} from '../../../../../src/Utils/requests'; // TODO: so many ../ 


// creating a new component modeled after Roster.jsx
export default function TeacherSubmission( { classroomId } ) {
  // these are the state variables we need access to
  const [classroom, setClassroom] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]); // this is an array, so we do the [] thing
  const [students, setStudents] = useState([]);
  const [activeLessonModule, setActiveLessonModule] = useState(null); // TODO: not sure if this is needed beyond getting activities, could be const?
  const [activity, setActivity ] = useState({});

  // From Researcher ActivityLevelReportView
  const [session, setSession] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  // useEffect will get us all our necessary state variables methinks
  useEffect(() => {
    // get the classroom from our input id
    const fetchData = async () => {
      const res = await getClassroom(classroomId);
      if (res.data) {
        const classroom = res.data;
        setClassroom(classroom);
        // students is grabbed too
        setStudents(classroom.students);
        // get list of assignments (taken from Home.jsx's approach)
        setSubmissions(classroom.submissions);
      // Copied from Researcher Page to get Session info
      const getData = async () => {
        const session = classroom.session
        setSession(session.data);
      }
      // Activities are taken
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
  };
  fetchData();
}, [classroomId]);

    // for the back button!
    const handleBack = () => {
      navigate('/dashboard');
    };
    
    // for the button of "Add Feedback"
    const AddFeedback = () =>{

    }

    // for changing students in the dropdown
    const changeStudent = (selectedValue) => {
      const selectedStudent = selectedValue;

      setSession(classroom.sessions[0]);

    }

    const changeActivity = (selectedValue) => {
      // Extract the activity number from the selected value (e.g., "Activity 1" -> "1")
      const activityNumber = parseInt(selectedValue.split(' ')[1]);
    
      // Find the activity with the matching number
      const selectedActivity = activities[activityNumber -1];
    
      if (selectedActivity) {
        setActivity(selectedActivity);
      } else {
        // Handle the case where the selected activity is not found
        console.error('Selected activity not found');
      }
    }

    // Replay button from ActivityLevelReportView
    const showReplayButton = () => {
      // if (session.saves?.length) {
      //   const latestSave = session.saves[session.saves.length - 1];
        return (
          <Link id='replay-btn' className='btn' to={`/replay/${session}`}>
            View Code Replay
          </Link>
        );
      // }
    };

    const submission = () => {
      if (session != null) {
        if (session.students.contains(selectedStudent)) {
          return (
            <div className="Student-submission" style={{ marginTop: '20px', marginBottom: '50px' }}></div>
         );
          }
        else {
          <div className="Student-submission" style={{ marginTop: '20px', marginBottom: '50px' }}>No Submission</div>
          }
        }
    }

    return (
      <div>
      <button id='home-back-btn' onClick={handleBack}>
        <i className='fa fa-arrow-left' aria-hidden='true' />
      </button>

      <div className="submission-menu">
        <Select defaultValue="Student" className="section" onChange={changeStudent}>
          {/* Dropdown menu for Student section */}
          {students.map((student) => (
            <Option key={student.id} value={student.name}/>
          ))}
          {/* Add other options related to students if needed */}
        </Select>

        <Select defaultValue="Activity" className="section" onChange={changeActivity}>
          {/* Dropdown menu for Activity section */}
          { activities.map((activity) => (
            <Option key = {activity.number} value={"Activity " + activity.number}/>
          ))}

          {/* Add other options related to students if needed */}
        </Select>

        <Select defaultValue="Class" className="section">
          {/* Dropdown menu for Class section */}
            <Option key ={classroomId} value={classroom.name}/>
          {/* Add other options related to class if needed */}
        </Select>
      </div>

      <div className="comment-bar" style={{ marginTop: '100px' }}>
        <span className="comment-text">Student Comment </span>
      </div>
      <div className='Student-comment' style={{ marginTop: '00px', marginBottom: '50px' }}></div>
      

      <div className="top-bar" style={{ marginTop: '50px', display: 'flex', flexDirection:"row" }}>
        <button style={{ marginTop: '10px', marginLeft:'30px'}}> 
          <div className="feedback-button">
            <span className="feedback-text">Add Feedback </span>
          </div>
        </button>

        <button style={{ marginTop: '10px', marginRight: '30px' }}>
          <div className='Rubric-button'>
            <span className='Rubric-text'> Show Rubric</span>
          </div>
        </button>
      </div>


      <br />
       {showReplayButton()}
       {/* {submission()} */}
       <div>
       <StudentCanvas activity={activity} />
    </div>
    </div>
    

    
    );
}