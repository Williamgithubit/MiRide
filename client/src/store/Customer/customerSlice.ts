//import the required tool to create the regular slice
import { createSlice } from '@reduxjs/toolkit';

//define the initial state of the slice
const initialState = {
    customers: [],
    loading: false,
    error: null
};

//create the slice
const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        //define the reducers
        
    },
    extraReducers: (builder) => {
        //define the extra reducers
    }
});

