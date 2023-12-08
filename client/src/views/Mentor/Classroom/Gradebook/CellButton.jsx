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
    
            const scoredRubricId = highestScoredRubric.id;

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
        } else {
            let color;
            if (editedScore >= 80) {
                // Greenish colors, darker for higher scores
                const greenIntensity = 255 - ((editedScore - 80) * (255 - 102) / 20);
                color = `rgb(0, ${Math.max(greenIntensity, 102)}, 0)`;
            } else if (editedScore >= 70) {
                // Brighter yellow as we approach 80
                const transitionFactor = (editedScore - 70) / 10;
                const yellowRedIntensity = 255; // Full red component for bright yellow
                const yellowGreenIntensity = 165 + transitionFactor * (255 - 165); // Increase green for brighter yellow
                color = `rgb(${yellowRedIntensity}, ${yellowGreenIntensity}, 0)`;
            } else if (editedScore >= 60) {
                // Orangeish colors, darker for lower scores
                const transitionFactor = (70 - editedScore) / 10;
                const orangeRedIntensity = 255;
                const orangeGreenIntensity = 140 + transitionFactor * (165 - 140);
                color = `rgb(${orangeRedIntensity}, ${orangeGreenIntensity}, 0)`;
            } else {
                // Reddish colors, darker for lower scores
                const redIntensity = 139 + ((editedScore / 60) * (255 - 139));
                color = `rgb(${Math.min(redIntensity, 255)}, 0, 0)`;
            }
            return color;
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
            onChange={(e) => setEditedScore(Math.min(Number(e.target.value), activity.rubric.max_score))} // Edited score cannot exceed the maximum score for the activity
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




