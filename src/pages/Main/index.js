import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List } from './styles';
import Container from '../../components/container';

export default class Main extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    newRepo: '',
    repositories: [],
    loading: false, // propriedade que vai servir para verificar se a pagina está carregando
    hasError: null,
  };

  // Carregar os dados do LocalStorage
  componentDidMount() {
    // recupero o item que foi adicionado no localStorage e jogo na variavel repositories
    const repositories = localStorage.getItem('repositories');

    // jogo esse item para o state repositories
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // Salvar os dados do localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    // Verifico se foi adicionado algum repositorio na List, se foi eu adiciona esse Item no localStorage
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  // Funcão para pegar o que foi digitado no inputp
  handleInputChange = (e) => {
    this.setState({ newRepo: e.target.value, hasError: null });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    this.setState({ loading: true, hasError: null });

    // tenta executar esse codigo, se der erro ele cai no catch e coloca a borda do input vermelha
    try {
      const { newRepo, repositories } = this.state;

      // procuro no state newRepo se já existe um repositorio igual ao que o usuario digitou
      const hasRepo = repositories.find((r) => r.name === newRepo);

      if (hasRepo) throw new Error('Repositório duplicado');

      // pego o repositório na api passando o que foi digitado no input como newRepo
      const response = await api.get(`/repos/${newRepo}`);

      // busco do repositório somente o full_name
      const data = {
        name: response.data.full_name,
      };

      // Adiciono esse repositório no meu array repositories
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
      });
    } catch (error) {
      this.setState({
        hasError: true,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, hasError } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} hasError={hasError}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map((repository) => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
