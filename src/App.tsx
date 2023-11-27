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
import {fetchAssignmentWeights, fetchStudentGrades, calculateStudentFinalGrade} from "./utils/calculate_grade";

function App() {
  // You will need to use more of these!
  const [currClassId, setCurrClassId] = useState<string>("");
  const [classList, setClassList] = useState<IUniversityClass[]>([]);
  const [studentList, setStudentList] = useState<string[]>([]);
  const [studentName, setStudentName] = useState<IStudent[]>([]);
  const [studentNameList, setStudentNameList] = useState<string[]>([]);
  const [finalGrade, setFinalGrade] = useState<IAssignmentWeights[]>([]);

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
  const fetchSomeData = async () => {
    const res = await fetch("https://cat-fact.herokuapp.com/facts/", {
      method: "GET",
    });
    const json = await res.json();
    console.log(json);
  };

  useEffect(() => {
    // const setClassList = async() => {

    // }
    const fetchClassList = async() => {
      const res = await fetch('https://spark-se-assessment-api.azurewebsites.net/api/class/listBySemester/fall2022?buid=U33152475',
      
      {
        method: 'GET',
        headers: GET_DEFAULT_HEADERS() 
      }
      )
      if (!res.ok) {
        throw new Error('Failed to fetch class list');
        console.error('Error fetching class list');
      }
      const data = await res.json();
      console.log('API Response:', data);

      setClassList(data);
      console.log('class list: ', classList);

      const classIds = data.map((string: { classId: any; }) => string.classId);
      console.log(classIds);
      return classIds;
    }

    
    const classIds = fetchClassList();
    console.log("a: ", classIds);


  }, [BASE_API_URL]);

  useEffect(() => {
    const fetchStudentList = async () => {
      try {
        if (currClassId) {
          console.log("current classs ID: ", currClassId);

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
    // Fetch student names for the selected class
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
    console.log("student name:", studentNameList);
  }, [studentList]);



  
  // useEffect(() => {
  //   const fetchStudentName = async (studentId: string) => {
  //     try {
  //       const res = await fetch(
  //         `${BASE_API_URL}/student/GetById/${studentId}?buid=${MY_BU_ID}`,
  //         {
  //           method: 'GET',
  //           headers: GET_DEFAULT_HEADERS(),
  //         }
  //       );
  
  //       if (!res.ok) {
  //         throw new Error('Failed to fetch student list');
  //       }
  
  //       const data = await res.json();
  //       // console.log("data:", data);
  //       // console.log("student name2:", data[0].name);

  //       return data[0].name;
  //     } catch (error) {
  //       console.error('Error fetching student list:', error);
  //       return null;
  //     }
  //   };
  
  //   const fetchStudentNameList = async () => {
  //     try {
  //       const setStudentNameList = [];
        
  //       for (let i = 0; i < studentList.length; i++) {
  //         const studentId: string = studentList[i];
  //         const studentName = await fetchStudentName(studentId);
  //        // console.log("student name:", studentName);

  //       if (studentName) {
  //         setStudentNameList.push(studentName); // Adds the student name to the list
  //         }

  //       }
  //       console.log("all student names:", setStudentNameList);



  //     // try {
  //     //   for (let i = 0; i < studentList.length; i++) {
  //     //     fetchStudentName(studentList[i]);
  //     //     console.log("student name:", studentName);
  //     //   }
  //       // const names = await Promise.all(studentList.map((studentId) => fetchStudentName(studentId)));
  //       // console.log("Student names:", names);

  //     } catch (error) {
  //       console.error('Error fetching student names:', error);
  //     }
  //   };
  
  //   if (studentList.length > 0) {
  //     fetchStudentNameList();
  //   }
  // }, [currClassId]);


  // fetchAssignmentWeights(currClassId);
  // fetchStudentGrades(studentList[0], currClassId);

  console.log("studentlist[0] : ", studentList[0])
  console.log("currClassId:", currClassId)
  
  calculateStudentFinalGrade(studentList[0], currClassId);


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
          <div>Place the grade table here</div>
           {/*need to use Table or DataGrid, as specified by assignment */}
           <GradeTable
            studentList={studentList}
            studentNameList={studentNameList}
            currClassId={currClassId}
            classList={classList}
          />

        </Grid>
      </Grid>
    </div>
  );
}

export default App;
