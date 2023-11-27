import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Input, Menu, message } from "antd";
import { UserOutlined } from '@ant-design/icons';

export default function CellButton({ student, activity, score }) {
    // Default values for different states
    const noSubmissionValue = "-";
    const ungradedValue = "Grade Pending";

    //console.log("!!!!!SCORES: ", score);

    console.log("CellButton: ", student, activity, score);


    // Local state to store the edited score and track edit mode
    const [isCellEditMode, setIsCellEditMode] = useState(false);
    const [editedScore, setEditedScore] = useState(score);

    useEffect(() => {
        setEditedScore(score);
    }, [score]);


    /*
    // Function to calculate display score from submissions
    function calculateDisplayScore(submissions) {
        if (!submissions || submissions.length === 0) {
            return noSubmissionValue;
        }

        let totalScore = submissions.reduce((acc, submission) => 
            acc + (submission.scored_rubric ? submission.scored_rubric.total_score : 0), 0
        );
        
        // Assuming maxScore is a known value or a prop
        const maxScore = activity.maxScore || 100;
        let averageScore = totalScore / submissions.length;

        return totalScore > 0 ? (averageScore / maxScore) * 100 : 91; // Default score if no submissions
    }

    */


    // Modify getDisplayScore to use editedScore
    function getDisplayScore() {
        return editedScore;
    }


    // Function to handle score change and exit edit mode
    const handleScoreSave = (e) => {
        if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
            setIsCellEditMode(false);
            if (onScoreChange) {
                //onScoreChange(student, activity, editedScore);
                // TODO: Implement the logic to update the score in the backend
            }
        }
    };


     // Toggle edit mode for the cell
     const toggleCellEditMode = () => {
        setIsCellEditMode(!isCellEditMode);
    };

    // Function for dynamic coloring based on score
    function dynamicColoring(score) {
        console.log("SCORE: ", score);
        if (score === noSubmissionValue) {
            return 'gray';
        } else if (score >= 95) {
            return '#008000'; // Dark Green
        } else if (score >= 90 && score < 95) {
            return '#32CD32'; // Lime Green
        } else if (score >= 80 && score < 90) {
            return '#90EE90'; // Light Green
        } else if (score >= 70 && score < 80) {
            return '#FFBF00'; // Amber
        } else if (score >= 60 && score < 70) {
            return '#FFA500'; // Orange
        } else if (score === 0) {
            return 'grey'; // Grey for ungraded
        } else {
            return 'red'; // Red for all other scores
        }
    }

    // Dropdown options for the button
    const items = [
        {
            label: 'Change grade',
            key: '1',
            icon: <UserOutlined />,
            onClick: toggleCellEditMode
        },
        {
            label: 'View submission',
            key: '2',
            icon: <UserOutlined />,
        },
        {
            label: '3rd menu item',
            key: '3',
            icon: <UserOutlined />,
            danger: true,
        },
        {
            label: '4th menu item',
            key: '4',
            icon: <UserOutlined />,
            danger: true,
            disabled: true,
        },
        ];
    
    
    const handleMenuButtonClick = (e) => {
        message.info('Click on menu button.');
        console.log('click menu button', e);
    };
    
    
    if (isCellEditMode) {
    return (
        <Input
            type="number"
            value={editedScore}
            onChange={(e) => setEditedScore(Number(e.target.value))}
            onBlur={handleScoreSave}
            onKeyDown={handleScoreSave}
            autoFocus
        />
    );
    } else {
        // Define the dropdown menu
        const dropdownMenu = (
            <Menu onClick={handleMenuButtonClick}>
                {items.map(item => (
                       <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                        {item.label}
                        </Menu.Item>
                ))}
            </Menu>
        );
    
        return (
            <Dropdown overlay={dropdownMenu} trigger={['click']}>
                <Button style={{ backgroundColor: dynamicColoring(score) }}>
                    {getDisplayScore()}
                </Button>
            </Dropdown>
        );
    }
}




