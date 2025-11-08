import { jsx as _jsx } from "react/jsx-runtime";
import { Grid as MuiGrid } from '@mui/material';
/**
 * Grid wrapper component that handles the Material UI v5 Grid API changes
 * This wrapper allows using the 'item' prop which was removed in MUI v5
 * but is still used throughout our codebase
 */
const Grid = (props) => {
    const { item, ...rest } = props;
    return _jsx(MuiGrid, { ...rest });
};
export default Grid;
