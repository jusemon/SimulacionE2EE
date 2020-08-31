using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace SimulacionE2EE.Hubs
{
    public class ChatHub : Hub
    {

        public static Dictionary<string, string> Users = new Dictionary<string, string>();

        /// <summary>
        /// Initializes the specified user.
        /// </summary>
        /// <param name="user">The user.</param>
        public async Task Init(string user)
        {
            Users.Add(user, Context.ConnectionId);
            await Clients.All.SendAsync("ListUsers", Users.Keys.ToArray());
        }

        /// <summary>
        /// Se inicia una conversación, aquí intercambiamos claves públicas entre los dos destinos.
        /// </summary>
        /// <param name="fromUser">From user.</param>
        /// <param name="toUser">To user.</param>
        public async Task StartCoversation(string fromUser, string toUser)
        {
            await Clients.Client(Users[toUser]).SendAsync("StartedConversation", fromUser, toUser);
            await Clients.Client(Users[fromUser]).SendAsync("StartedConversation", toUser, fromUser);
            await Clients.Client(Users[toUser]).SendAsync("RequestedPublicKey", fromUser, toUser);
            await Clients.Client(Users[fromUser]).SendAsync("RequestedPublicKey", toUser, fromUser);
        }

        /// <summary>
        /// Intercambiamos claves públicas en tiempo real.
        /// </summary>
        /// <param name="user">The user.</param>
        /// <param name="publicKey">The public key.</param>
        public async Task SendPublicKey(string fromUser, string toUser, string publicKey)
        {
            await Clients.Client(Users[toUser]).SendAsync("ReceivePublicKey", fromUser, toUser, publicKey);
        }

        /// <summary>
        /// Enviamos mensajes cifrados
        /// </summary>
        /// <param name="user">The user.</param>
        /// <param name="message">The message.</param>
        public async Task SendMessage(string fromUser, string toUser, string message)
        {
            await Clients.Client(Users[toUser]).SendAsync("ReceiveMessage", fromUser, toUser, message);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            if (Users.ContainsValue(Context.ConnectionId))
            {
                Users.Remove(Users.First(u => u.Value == Context.ConnectionId).Key);
                await Clients.All.SendAsync("ListUsers", Users.Keys.ToArray());
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
