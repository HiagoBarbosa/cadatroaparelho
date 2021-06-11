describe('Cadastro de aparelho sem senha', () => {

  it('Identificador do aparelho', () => {
    cy.getTokenCredentials()
    cy.imeiGenerator()
    cy.fixture('access_tokenCredential').then((access_tokenCredential) =>{
      cy.fixture('imeiGen').then((imeiGen) =>{      
        cy.request({
          method:'GET',
          url:`http://172.16.5.87:4622/api/aparelhos/${imeiGen.IMEI}/usuario`,
          headers: {
            Authorization:`Bearer ${access_tokenCredential.access_token}` 
          }
        }).then((response) => { 
            console.log(response)
            cy.writeFile('cypress/fixtures/00-identificador.json', response.body, 'binary')
            expect(response.status).to.equal(200);
        })  
      })        
    })
  })

  it('Autentica Cartão', () => {
    cy.credencialsDB()
    cy.alteraSenhaCartao()
    cy.fixture('access_tokenCredential').then((access_tokenCredential) =>{
      cy.fixture('credencialsDB').then((credencialsDB) =>{      
        cy.request({
          method:'POST',
          url:`http://172.16.5.87:4622/api/usuarios/autenticacao/cartao`,
          failOnStatusCode: false,
          headers: {
            'user-agent': "Mozilla/5.0",
            Authorization:`Bearer ${access_tokenCredential.access_token}`,
            'Content-Type': 'application/json'
          },
          body: {
            DesUsuario: `${credencialsDB[0].num_cpf}`,
            NumCartao: `603409${credencialsDB[0].numcartao}`,
            DesSenha: "05070403"
          }
        }).then((response) => { 
              console.log(response)
              cy.writeFile('cypress/fixtures/01-autenticaCartao.json', response.body, 'binary')
              expect(response.status).to.equal(200);
        })  
      })        
    })
  })

  it('Pergunta secreta', () => {
    cy.alteraPerguntaSecreta()
    cy.fixture('access_tokenCredential').then((access_tokenCredential) =>{
      cy.fixture('credencialsDB').then((credencialsDB) =>{   
        cy.fixture('01-autenticaCartao').then((autenticaCartao) =>{  
          cy.request({
              method:'POST',
              url:`http://172.16.5.87:4622/api/usuarios/autenticacao/pergunta-secreta`,
              headers: {
              'user-agent': "Mozilla/5.0",
              Authorization:`Bearer ${access_tokenCredential.access_token}`,
              'Content-Type': 'application/json'
              },
              body: {
              DesUsuario: `${credencialsDB[0].num_cpf}`,
              codPerguntaSecreta: `${autenticaCartao.codPerguntaSecreta}`,
              desRespostaSecreta: "1000"
              }
          }).then((response) => { 
              console.log(response)
              cy.writeFile('cypress/fixtures/02-perguntaSecreta.json', response.body, 'binary')
              expect(response.status).to.equal(200);
          })
        })  
      })        
    })
  })

  it('Cadastro de senha eletrônica', () => {
    cy.fixture('access_tokenCredential').then((access_tokenCredential) =>{
      cy.fixture('credencialsDB').then((credencialsDB) =>{     
        cy.request({
          method:'POST',
          url:`http://172.16.5.87:4622/api/usuarios`,
          headers: {
          'user-agent': "Mozilla/5.0",
          Authorization:`Bearer ${access_tokenCredential.access_token}`,
          'Content-Type': 'application/json'
          },
          body: {
          DesUsuario: `${credencialsDB[0].num_cpf}`,
          desSenha: '152315',
          geoLocationError: '1',
          latitude: '1',
          longitude: '1'
          }
        }).then((response) => { 
          console.log(response)
          cy.writeFile('cypress/fixtures/03-cadastraSenhaEletronica.json', response.body, 'binary')
          expect(response.status).to.equal(200);
        })   
      })        
    })
  })

  it('Valida Token', () => {
    cy.tokenDB()
    //cy.pause()
    cy.fixture('access_tokenCredential').then((access_tokenCredential) => {
      cy.fixture('imeiGen').then((imeiGen) =>{
        cy.fixture('tokenDB').then(tokenDB => {
          var texto = tokenDB[0].des_texto
          var token = texto.substr(-6, 6)
          cy.log(token)              
          cy.request({
            method:'POST',
            url:`http://172.16.5.87:4622/api/aparelhos/${imeiGen.IMEI}/token`,
            headers: { 
              'user-agent': "PostmanRuntime/7.26.10",
              Authorization:`Bearer ${access_tokenCredential.access_token}`,      
            },
            body:{
              "desToken": `${token}`
            }
          }).then((response) => { 
            //console.log(response)
            cy.writeFile('cypress/fixtures/04-validarToken.json', response.body, 'binary')
            expect(response.status).to.equal(200);
          })
        })
      })
    })  
  })
})