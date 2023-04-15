import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import styled from "styled-components";

export default function CreateLaudoFinal() {
  const [amostras, setAmostras] = useState([]);
  const [editedValues, setEditedValues] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const amostrasResponse = await axios.get(
          "http://localhost:4000/amostras"
        );
        setAmostras(amostrasResponse.data);

        const initialEditedValues = {};
        amostrasResponse.data.forEach((amostra) => {
          amostra.identAmostra.forEach((ident) => {
            initialEditedValues[`${amostra.id}_${ident.id}`] = {
              ufcmicroorganismo: ident.ufcmicroorganismo,
              ufccoliformes: ident.ufccoliformes,
              ufcbolor: ident.ufcbolor,
            };
          });
        });
        setEditedValues(initialEditedValues);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, []);

  async function handleEdit(identId, amostraId, field, value) {
    if (isNaN(identId) || identId === null || identId === undefined) {
      throw new Error(`IdentId '${identId}' is not a valid number`);
    }

    try {
      await axios.put(
        `http://localhost:4000/tipoamostra/${amostraId}/${identId}`,
        { [field]: value }
      );

      setAmostras((prevAmostras) => {
        const updatedAmostras = [...prevAmostras];
        const amostraIndex = updatedAmostras.findIndex(
          (amostra) => amostra.id === amostraId
        );
        if (amostraIndex >= 0) {
          const identIndex = updatedAmostras[
            amostraIndex
          ].identAmostra.findIndex((ident) => ident.id === identId);
          if (identIndex >= 0) {
            updatedAmostras[amostraIndex].identAmostra[identIndex][field] =
              value;
          }
        }
        return updatedAmostras;
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const amostrasResponse = await axios.get(
          "http://localhost:4000/amostras"
        );
        setAmostras(amostrasResponse.data);

        const initialEditedValues = {};
        amostrasResponse.data.forEach((amostra) => {
          amostra.identAmostra.forEach((ident) => {
            if (!isNaN(ident.id)) {
              initialEditedValues[`${amostra.id}_${ident.id}`] = {
                ufcmicroorganismo: ident.ufcmicroorganismo,
                ufccoliformes: ident.ufccoliformes,
                ufcbolor: ident.ufcbolor,
              };
            }
          });
        });
        setEditedValues(initialEditedValues);
      } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch data from server");
      }
    }
    fetchData();
  }, []);

  function handleInputChange(event, amostraId, identId, field) {
    setEditedValues({
      ...editedValues,
      [`${amostraId}_${identId}`]: {
        ...editedValues[`${amostraId}_${identId}`],
        [field]: event.target.value,
      },
    });

    handleEdit(identId, amostraId, field, event.target.value);
  }
  return (
    <>
      <Titulo>
        <h1>Inserir Resultados Finais</h1>
      </Titulo>

      {amostras.map((amostra) => (
        <TodosOsDadosBox key={amostra.id}>
          <Title>
            <h1>Informações cadastrais</h1>
          </Title>
          <DadosDoClienteGrid>
            <p>Solicitante: {amostra.entreguePor}</p>
            <p>Propriedade: {amostra.fazenda}</p>
            <p>Data da coleta: {amostra.datadaColeta}</p>
            <p>Entregue por: {amostra.entreguePor}</p>
            <p>Matriz analítica: cultura liquida on farm</p>
            <p>Proprietário:</p>
            <p>Entrada no laboratório: {amostra.entradaNoLab}</p>
            <p>Município: {amostra.municipio}</p>
            <p>Estado: {amostra.estado}</p>
            <p>Temperatura: {amostra?.temperatura}</p>
          </DadosDoClienteGrid>

          <Title>
            <h1>Apresentação dos resultados</h1>
          </Title>
          {amostra.identAmostra.map((ident) => (
            <DadosDaAmostraBox key={ident.id}>
              <Separador />
              <DadosDosResultados>
                <label>
                  <h1>Código:</h1>
                  <p>{ident.codigo}</p>
                </label>

                <label>
                  <h1>Amostra OnFarm: </h1>
                  <p>{ident.microorganismo}</p>
                </label>

                <label>
                  <h1>Produto Comercial:</h1>
                  <p>{ident.produtocultura}</p>
                </label>

                <label>
                  <h1>(UFC/ML) Amostra OnFarm</h1>
                  <p>
                    {editedValues[`${amostra.id}_${ident.id}`] ? (
                      <SelectBolor
                        name="ufcmicroorganismo"
                        value={
                          editedValues[`${amostra.id}_${ident.id}`]
                            ?.ufcmicroorganismo ?? ""
                        }
                        onChange={(event) =>
                          handleInputChange(
                            event,
                            amostra.id,
                            ident.id,
                            "ufcmicroorganismo"
                          )
                        }
                        onBlur={() =>
                          handleEdit(
                            ident.id,
                            amostra.id,
                            "ufcmicroorganismo",
                            editedValues[`${amostra.id}_${ident.id}`]
                              ?.ufcmicroorganismo ?? ""
                          )
                        }
                        editedValues={editedValues}
                        amostra={amostra}
                        ident={ident}
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="N.C.">N.C.</option>
                        {[...Array(10).keys()].map((i) =>
                          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                            <option key={`${i}${j}`} value={`${j}e${i}`}>
                              {`${j}x10^${i}`}
                            </option>
                          ))
                        )}
                      </SelectBolor>
                    ) : (
                      <span>
                        {ident.ufcmicroorganismo} :{" "}
                        <FaPen
                          onClick={() =>
                            setEditedValues({
                              ...editedValues,
                              [`${amostra.id}_${ident.id}`]: {
                                ...editedValues[`${amostra.id}_${ident.id}`],
                                ufcmicroorganismo: ident.ufcmicroorganismo,
                              },
                            })
                          }
                        />
                      </span>
                    )}
                  </p>
                </label>

                <label>
                  <h1>(UFC/ML) Coliformes</h1>
                  <p>
                    {editedValues[`${amostra.id}_${ident.id}`] ? (
                      <ColiformesSelect
                        name="ufccoliformes"
                        value={
                          editedValues[`${amostra.id}_${ident.id}`]
                            ?.ufccoliformes ?? ""
                        }
                        onChange={(event) =>
                          handleInputChange(
                            event,
                            amostra.id,
                            ident.id,
                            "ufccoliformes"
                          )
                        }
                        onBlur={() =>
                          handleEdit(
                            ident.id,
                            amostra.id,
                            "ufccoliformes",
                            editedValues[`${amostra.id}_${ident.id}`]
                              ?.ufccoliformes ?? ""
                          )
                        }
                        editedValues={editedValues}
                        amostra={amostra}
                        ident={ident}
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="N.C.">N.C.</option>
                        {[...Array(10).keys()].map((i) =>
                          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                            <option key={`${i}${j}`} value={`${j}e${i}`}>
                              {`${j}x10^${i}`}
                            </option>
                          ))
                        )}
                      </ColiformesSelect>
                    ) : (
                      <span>
                        {ident.ufccoliformes} :{" "}
                        <FaPen
                          onClick={() =>
                            setEditedValues({
                              ...editedValues,
                              [`${amostra.id}_${ident.id}`]: {
                                ...editedValues[`${amostra.id}_${ident.id}`],
                                ufccoliformes: ident.ufccoliformes,
                              },
                            })
                          }
                        />
                      </span>
                    )}
                  </p>
                  <h3>Valores ideiais para coliformes:</h3>
                  <h4> Menor ou igual a 5x10²</h4>
                </label>
                <label>
                  <h1>(UFC/ML) Bolor/Levedura</h1>
                  <p>
                    {editedValues[`${amostra.id}_${ident.id}`] ? (
                      <SelectBolor
                        name="ufcbolor"
                        value={
                          editedValues[`${amostra.id}_${ident.id}`]?.ufcbolor ??
                          ""
                        }
                        onChange={(event) =>
                          handleInputChange(
                            event,
                            amostra.id,
                            ident.id,
                            "ufcbolor"
                          )
                        }
                        onBlur={() =>
                          handleEdit(
                            ident.id,
                            amostra.id,
                            "ufcbolor",
                            editedValues[`${amostra.id}_${ident.id}`]
                              ?.ufcbolor ?? ""
                          )
                        }
                        editedValues={editedValues}
                        amostra={amostra}
                        ident={ident}
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="N.C.">N.C.</option>
                        {[...Array(10).keys()].map((i) =>
                          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((j) => (
                            <option key={`${i}${j}`} value={`${j}e${i}`}>
                              {`${j}x10^${i}`}
                            </option>
                          ))
                        )}
                      </SelectBolor>
                    ) : (
                      <span>
                        {ident.ufcbolor} :{" "}
                        <FaPen
                          onClick={() =>
                            setEditedValues({
                              ...editedValues,
                              [`${amostra.id}_${ident.id}`]: {
                                ...editedValues[`${amostra.id}_${ident.id}`],
                                ufcbolor: ident.ufcbolor,
                              },
                            })
                          }
                        />
                      </span>
                    )}
                  </p>
                  <h3>Valores ideais para Bolor/Levedura:</h3>
                  <h4>Menor que 1x10⁰</h4>
                </label>
              </DadosDosResultados>
            </DadosDaAmostraBox>
          ))}
        </TodosOsDadosBox>
      ))}
    </>
  );
}

// Styled components

const Titulo = styled.div`
  width: 100%;
  h1 {
    font-size: 20px;
    margin-top: 20px;
    color: blue;
    margin-bottom: 20px;
  }
`;

const DadosDoClienteGrid = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 10px;

  p {
    margin: 0;
    font-size: 15px;
  }
`;

const DadosDosResultados = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  gap: 10px;

  p {
    font-size: 15px;
  }

  h1 {
    margin-top: 10px;
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  h3 {
    margin-top: 10px;
    color: darkblue;
    font-weight: 700;
  }
`;

const TodosOsDadosBox = styled.div`
  margin-top: 20px;
  width: 100%;
  height: fit-content;
  background-color: lightgray;
  padding: 10px;
  border: 15px solid #283739;
`;

const DadosDaAmostraBox = styled.div`
  width: 100%;
  height: fit-content;
  background-color: lightgray;
`;

const Title = styled.div`
  display: flex;
  justify-content: center;
  background-color: #228896;
  padding: 5px;
  border-radius: 5px;
  width: 100%;

  h1 {
    font-weight: 700;
  }
`;

const Container = styled.div`
  border: 5px solid gray;
`;

const Separador = styled.div`
  width: 100%;
  height: 2px;
  background-color: gray;
  margin-top: 30px;
`;

const SelectDanger = styled.select`
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
`;

const SelectSuccess = styled.select`
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
`;

const ColiformesSelect = styled.select`
  ${({ editedValues, amostra, ident }) =>
    editedValues[`${amostra.id}_${ident.id}`]?.ufccoliformes <= 5e2
      ? SelectDanger
      : SelectSuccess};
  font-size: 15px;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
`;

const SelectBolor = styled.select`
  ${({ editedValues, amostra, ident }) =>
    editedValues[`${amostra.id}_${ident.id}`]?.ufccoliformes <= 5e2
      ? SelectDanger
      : SelectSuccess};
  font-size: 15px;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
`;
