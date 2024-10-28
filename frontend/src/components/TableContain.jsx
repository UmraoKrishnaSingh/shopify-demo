import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[800],
  color: theme.palette.common.white,
}));

function TableContain({ data }) {
  if (!data) {
    return (
      <TableContainer
        component={Paper}
        style={{
          backgroundColor: "#424242",
          margin: "20px",
          width: "80%",
          padding: "20px",
        }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Product</StyledTableCell>
              <StyledTableCell>Description</StyledTableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      component={Paper}
      style={{
        backgroundColor: "#424242",
        margin: "20px",
        width: "80%",
        padding: "20px",
      }}
    >
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Product</StyledTableCell>
            <StyledTableCell>Description</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <StyledTableCell>{item.title}</StyledTableCell>
              <StyledTableCell>{item.description || "-"}</StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableContain;
