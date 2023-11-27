import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Select, Typography } from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';


/**
 * You will find globals from this file useful!
 */
import {GET_DEFAULT_HEADERS, BASE_API_URL, MY_BU_ID} from "./globals";
import { IUniversityClass, IStudent, IAssignmentWeights} from "./types/api_types";
import {GradeTable} from "./components/GradeTable";
import {calcAllFinalGrade} from "./utils/calculate_grade";
import { log } from "console";

function App() {
  // You will need to use more of these!
  const [currClassId, setCurrClassId] = useState<string>("");
  const [classList, setClassList] = useState<IUniversityClass[]>([]);
  const [studentList, setStudentList] = useState<string[]>([]);
  const [studentNameList, setStudentNameList] = useState<string[]>([]);
  const [finalGrade, setFinalGrade] = useState<number[]>([]);

  /**
   * This is JUST an example of how you might fetch some data(with a different API).
   * As you might notice, this does not show up in your console right now.
   * This is because the function isn't called by anything!
   *
   * You will need to lookup how to fetch data from an API using React.js
   * Something you might want to look at is the useEffect hook.
   *
   * The useEffect hook will be useful for populating the data in the dropdown box.
   * You will want to make sure that the effect is only called once at component mount.
   *
   * You will also need to explore the use of async/await.
   *
   */


  useEffect(() => {

    const fetchClassList = async() => {
      // fetches a list of all class IDs
      const res = await fetch('https://spark-se-assessment-api.azurewebsites.net/api/class/listBySemester/fall2022?buid=U33152475',
      
      {
        method: 'GET',
        headers: GET_DEFAULT_HEADERS() 
      }
      )
      if (!res.ok) {
        throw new Error('Failed to fetch class list');
      }
      const data = await res.json();
      // console.log('API Response:', data);

      setClassList(data);
      // console.log('class list: ', classList);

      const classIds = data.map((string: { classId: any; }) => string.classId);
      return classIds;
    }
    const classIds = fetchClassList();
   // console.log("classIds: ", classIds);

  }, [BASE_API_URL]);


  useEffect(() => {
      // fetches a list of all student IDs, for a given class
    const fetchStudentList = async () => {
      try {
        if (currClassId) {
         // console.log("current classs ID: ", currClassId);

          const res = await fetch(
            `${BASE_API_URL}/class/listStudents/${currClassId}?buid=${MY_BU_ID}`,
            {
              method: 'GET',
              headers: GET_DEFAULT_HEADERS(),
            }
          );

          if (!res.ok) {
            throw new Error('Failed to fetch student list');
          }

          const data = await res.json();
          setStudentList(data);
        }
      } catch (error) {
        console.error('Error fetching student list:');
      }
    };

    fetchStudentList();
    console.log("student list:", studentList);
  }, [currClassId]);


  useEffect(() => {
      // Fetches a list of all student names for a given class
    const fetchStudentNameList = async () => {
      try {
        const names = await Promise.all(
          studentList.map(async (studentId) => {
            const res = await fetch(
              `${BASE_API_URL}/student/GetById/${studentId}?buid=${MY_BU_ID}`,
              {
                method: "GET",
                headers: GET_DEFAULT_HEADERS(),
              }
            );

            if (!res.ok) {
              throw new Error(`Failed to fetch student with ID: ${studentId}`);
            }

            const data = await res.json();
            return data[0]?.name 
          })
        );

        setStudentNameList(names);
      } catch (error) {
        console.error("Error fetching student names:", error);
      }
    };

    fetchStudentNameList();
   // console.log("student name:", studentNameList);
  }, [studentList]);



  useEffect(() => {
    // gets a list of the final grades for each student in a given class, 
    // by calling function from calculate_grade.ts

    const fetchData = async () => {
      try {
        const finalGrade = await calcAllFinalGrade(currClassId, studentList);
        setFinalGrade(finalGrade);
      //  console.log("calcAllFinalGrade returns", finalGrade);
      } catch (error) {
        console.error("Error fetching final grade:", error);
      }
    };
  
    fetchData();
  }, [studentList]);


  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        <Grid xs={12} container alignItems="center" justifyContent="center">
          <Typography variant="h2" gutterBottom>
            Spark Assessment
          </Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            Select a class
          </Typography>
          <div style={{ width: "100%" }}>
            
              <Select
              fullWidth={true}
              label="Class"
              value={currClassId}
              onChange={(event) => setCurrClassId(event.target.value as string)}
            >
              {classList.map((classItem) => (
                <MenuItem key={classItem.classId} value={classItem.classId}>
                  {classItem.title}
                </MenuItem>
              ))}
            </Select>
          </div>
        </Grid>


        <Grid xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Final Grades
          </Typography>
           <GradeTable
            studentList={studentList}
            studentNameList={studentNameList}
            currClassId={currClassId}
            classList={classList}
            finalGrade={finalGrade}
          />

        </Grid>
      </Grid>
    </div>
  );
}

export default App;
