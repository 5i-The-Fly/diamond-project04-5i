import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Input, Menu, message } from "antd";
import { UserOutlined } from '@ant-design/icons';
import {
    updateScoredRubric,
  } from '../../../../../src/Utils/requests';

export default function CellButton({ student, activity, score }) {
    // Default values for different states
    const noSubmissionValue = "-";
    const ungradedValue = "Grade Pending";

    //console.log("!!!!!SCORES: ", score);

    //console.log("CellButton: ", student, activity, score);


    // Local state to store the edited score and track edit mode
    const [isCellEditMode, setIsCellEditMode] = useState(false);
    const [editedScore, setEditedScore] = useState(score);

    useEffect(() => {
        setEditedScore(score);
    }, [score]);





    // Modify getDisplayScore to use editedScore
    function getDisplayScore() {
        return editedScore;
    }


    // Function to handle score change and exit edit mode
    const handleScoreSave = async (e) => {
        if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
            setIsCellEditMode(false);
    
            // Filter scoredRubrics for the current student and activity, then find the one with the highest score
            const scoredRubricsForStudent = activity.scored_rubrics
                .filter(r => r.student === student.id && r.activity === activity.id);

            // Student may have more than one scoredRubric for the same activity, so we need to find the one with the highest score, because this is what is in the gradebook
            const highestScoredRubric = scoredRubricsForStudent.reduce((max, rubric) => (rubric.totalScore > max.totalScore ? rubric : max), { totalScore: -1 });

            console.log("Highest Scored Rubric: ", highestScoredRubric);
    
            const scoredRubricId = highestScoredRubric.id;

            console.log("Scored Rubric ID: ", scoredRubricId);

    
            if (scoredRubricId) {
                try {
                    // Call the API function to update the score
                    await updateScoredRubric(scoredRubricId, editedScore);
                    message.success('Score updated successfully');
                } catch (error) {
                    message.error('Failed to update score');
                    console.error('Error updating score:', error);
                }
            } else {
                console.error('No matching scoredRubric found');
                message.error('Could not update score: No matching scoredRubric found');
            }
        }
    };


     // Toggle edit mode for the cell
     const toggleCellEditMode = () => {
        setIsCellEditMode(!isCellEditMode);
    };

    // Function for dynamic coloring based on score
    function dynamicColoring(editedScore) {
        if (editedScore === noSubmissionValue) {
            return 'gray';
        } else if (editedScore >= 95) {
            return '#008000'; // Dark Green
        } else if (editedScore >= 90 && editedScore < 95) {
            return '#32CD32'; // Lime Green
        } else if (editedScore >= 80 && editedScore < 90) {
            return '#90EE90'; // Light Green
        } else if (editedScore >= 70 && editedScore < 80) {
            return '#FFBF00'; // Amber
        } else if (editedScore >= 60 && editedScore < 70) {
            return '#FFA500'; // Orange
        } else if (editedScore === 0) {
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
                <Button style={{ backgroundColor: dynamicColoring(editedScore) }}>
                    {getDisplayScore()}
                </Button>
            </Dropdown>
        );
    }
}




