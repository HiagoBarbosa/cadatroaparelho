

describe('Cadastro de aparelho com senha', () => {
    //Identificador OK  
    it('Identificador', () => {
      cy.imeiGenerator()
      cy.getTokenCredentials()
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

    //Regras do caso de uso:
    //Usuário sem restrição no cpf, na base e cartão liberado
    it('Autentica Cartões', () => {
        cy.fixture('access_tokenCredential').then((access_tokenCredential) => {
            cy.request({
                method: 'POST',
                url: 'http://172.16.5.87:4622/api/usuarios/autenticacao/cartao',
                failOnStatusCode: false,
                headers: {
                'user-agent': "PostmanRuntime/7.26.10",
                Authorization: `Bearer ${access_tokenCredential.access_token}`
                },
                body: {
                "DesUsuario": "51194090087",
                "NumCartao": "6034091132927041",
                "DesSenha": "05070403"
                }
            }).then((response) => {
                console.log(response)
                cy.writeFile('cypress/fixtures/01-autenticaCartoes.json', response.body, 'binary')
                expect(response.status).to.equal(200);
            })
        })
    }) 
    it('Pergunta secreta', () => {
        cy.fixture('access_tokenCredential').then((access_tokenCredential) => {
            cy.fixture('01-autenticaCartoes').then((autenticaCartoes) => {
                cy.request({
                    method:'POST',
                    url:'http://172.16.5.87:4622/api/usuarios/autenticacao/pergunta-secreta',
                    headers: { 
                    Authorization:`Bearer ${access_tokenCredential.access_token}`,      
                    },
                    body:{
                    "desUsuario": "51194090087",
                    "codPerguntaSecreta": `${autenticaCartoes.codPerguntaSecreta}`, 
                    "desRespostaSecreta": "1000"
                    }
                }).then((response) => {
                    console.log(response)
                    cy.writeFile('cypress/fixtures/02-perguntaSecreta.json', response.body, 'binary')
                    expect(response.status).to.equal(200);
                })
            })  
        })
    })
    it('Valida Token', () => {
        //cy.wait(9000)
        cy.tokenDBSenha()
        //cy.pause()
        cy.fixture('access_tokenCredential').then((access_tokenCredential) => {
          cy.fixture('imeiGen').then((imeiGen) =>{
            cy.fixture('tokenDBSenha').then(tokenDB => {
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
                cy.writeFile('cypress/fixtures/03-validarToken.json', response.body, 'binary')
                expect(response.status).to.equal(200);
              })
            })
          })
        })  
      })
})
  