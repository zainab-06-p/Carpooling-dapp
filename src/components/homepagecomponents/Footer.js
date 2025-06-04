import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center">
          <Col size={12} sm={6}>
          
            <img 
              src="/assets/img.png" 
              alt="Carpooling Dapp Logo" 
              style={{ width: "150px", height: "auto" }}
            />
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
